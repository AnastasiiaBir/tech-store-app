// app.js
require('dotenv').config(); // Загружает переменные окружения из .env

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var expressLayouts = require('express-ejs-layouts');

// Импортируем наше подключение к БД и все модели
const { sequelize, connectToDatabase } = require('./config/database');
const { Cliente, Producto, Pedido, Trabajo, PedidoProducto, Mensaje } = require('./models'); // Импортируем модели и их связи

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Импортируем роуты
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth'); // НОВЫЙ роут для аутентификации
var adminRouter = require('./routes/admin'); // НОВЫЙ роут для администратора
var clientRouter = require('./routes/client'); // НОВЫЙ роут для клиента

var app = express();

// --- Настройка движка шаблонов ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Используем express-ejs-layouts
app.use(require('express-ejs-layouts'));

// --- Стандартные middleware Express ---
app.use(logger('dev'));
app.use(express.json()); // Для обработки JSON запросов
app.use(express.urlencoded({ extended: false })); // Для обработки URL-encoded данных форм
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// --- Настройка сессий ---
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions', // Имя таблицы для хранения сессий в БД
  checkExpirationInterval: 15 * 60 * 1000, // Каждые 15 минут удалять истекшие сессии
  expiration: 24 * 60 * 60 * 1000 // Сессии истекают через 24 часа
});

app.use(session({
  secret: process.env.SESSION_SECRET, // Секретный ключ из .env
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // В продакшене используй true и https
}));
sessionStore.sync(); // Синхронизировать таблицу сессий

// Middleware для добавления информации о пользователе в req.locals для EJS
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.userId ? true : false;
  res.locals.user = req.session.user || null; // Сохраняем объект пользователя в сессии

    // ---- Новая строка для дефолтного title, чтобы избежать ошибок в layout.ejs ----
  res.locals.title = 'Tech Store';

   // console.log('app.js: res.locals before next:', res.locals); // НЕ РАСКОММЕНТИРУЙТЕ ЭТО
  next();
});

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 минут
  max: 3, // 3 попытки
  handler: (req, res) => {
    res.status(429);
    res.render("errorLimit", {
      mensaje: "Has superado el número de intentos de inicio de sesión. Intenta más tarde."
    });
  }
});

// --- Подключение роутов ---
app.use('/', indexRouter);
app.use('/auth/login', loginLimiter); // Лимитируем только логин
app.use('/auth', authRouter); // Роуты для входа/регистрации
app.use('/admin', adminRouter); // Защищенные роуты для администратора
app.use('/client', clientRouter); // Защищенные роуты для клиента


// --- Обработка 404 ошибок ---
app.use(function(req, res, next) {
  next(createError(404));
});

// --- Обработка ошибок ---
app.use(function(err, req, res, next) {
  // Устанавливаем locals, предоставляя ошибки только в режиме разработки
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Рендерим страницу ошибки
  // Передаем title в рендер, чтобы layout.ejs не ругался на undefined
  res.status(err.status || 500);
  res.render('error', { title: 'Error' }); // <-- Добавлен параметр title для error.ejs
});

// --- Синхронизация базы данных и запуск сервера ---
async function startApp() {
  await connectToDatabase(); // Подключаемся к БД
  // sequelize.sync({ alter: true })
  // Если ты уверен, что БД создана SQL-скриптом, и не хочешь, чтобы Sequelize ее менял,
  // можешь использовать `force: false` (не удалять таблицы)
  // или `alter: true` (вносить изменения без удаления)
  // Для первого запуска после создания SQL-скриптом, force: false - самый безопасный вариант.
  // ВНИМАНИЕ: force: true УДАЛЯЕТ ВСЕ ДАННЫЕ В ТАБЛИЦАХ И СОЗДАЕТ ИХ ЗАНОВО!
  try {
    await sequelize.sync(); // Будет изменять таблицы под модели, не удаляя данные.
    console.log('Todos los modelos están sincronizados con la base de datos.');

    // ВОТ СЮДА МОЖНО ПОМЕСТИТЬ ЛОГИ, ЕСЛИ ОНИ НУЖНЫ:
    // console.log('app.js: View engine settings:', app.settings['view engine'], 'views:', app.settings['views']);
    // console.log('app.js: Layout middleware applied.');

  } catch (error) {
    console.error('Error al sincronizar los modelos con la base de datos:', error);
  }
}

startApp(); // Запускаем функцию старта приложения

// --- Настройка WebSocket через Socket.IO ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.set('io', io);
// Слушаем подключение клиента
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado a WebSocket');

  // Клиент или админ при подключении должен сообщать, кто он, и к какой комнате подключается:
  socket.on('joinRoom', ({ clienteId, role }) => {
    if (!clienteId || !role) return;
    const room = `cliente_${clienteId}`;
    socket.join(room);
    console.log(`${role} Conectado a la sala ${room}`);
  });

  // 📩 Обработка отправки email сообщения
  socket.on('nuevoMensaje', async (data) => {
    console.log('[WebSocket] Nuevo mensaje recibido:', data);
    try {
      const nuevoMensaje = await Mensaje.create({
        clienteId: data.clienteId,
        contenido: data.contenido,
        asunto: null, // для чата тема не нужна
        // дата и остальные поля по умолчанию
        remitente: 'cliente'
      });

      const room = `cliente_${data.clienteId}`;

      // Отправляем сообщение только в комнату клиента (всем, кто слушает)
      io.to(room).emit('mensajeRecibido', {
        id: nuevoMensaje.id,
        clienteId: nuevoMensaje.clienteId,
        contenido: nuevoMensaje.contenido,
        fechaEnvio: nuevoMensaje.fechaEnvio,
        remitente: 'cliente',
      });

      console.log('✅ Mensaje guardado correctamente en la base de datos, ID:', nuevoMensaje.id);
  } catch (err) {
    console.error('❌ Error al guardar el mensaje:', err);
  }
  });

      socket.on('respuestaAdmin', async (data) => {
    try {
      const mensaje = await Mensaje.create({
        clienteId: data.clienteId,
        contenido: data.contenido,
        remitente: 'admin',
        asunto: null,
      });

      const room = `cliente_${data.clienteId}`;

      // Отправляем сообщение в комнату клиента
      io.to(room).emit('mensajeRecibido', {
        id: mensaje.id,
        clienteId: mensaje.clienteId,
        contenido: mensaje.contenido,
        remitente: 'admin',
        fechaEnvio: mensaje.fechaEnvio,
      });

      console.log('✅ El administrador envió la respuesta al cliente');
    } catch (error) {
      console.error('Error al enviar la respuesta del administrador WebSocket:', error);
    }
  });

  socket.on('obtenerHistorial', async ({ clienteId, requesterId, role }) => {
  if (role === 'cliente' && requesterId !== clienteId) {
    return socket.emit('error', 'Sin acceso a los mensajes de otras personas');
  }

  const historial = await Mensaje.findAll({
    where: { clienteId },
    order: [['fechaEnvio', 'ASC']]
  });

  socket.emit('historialMensajes', historial);
});



  // 💬 Обработка сообщений в чате
  socket.on('mensajeChat', (mensaje) => {
    io.emit('mensajeChat', mensaje); // Отправка всем клиентам
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado de WebSocket');
  });
});

// 🚀 Запуск сервера
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌐 Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app;