// controllers/authController.js
const { Cliente } = require('../models');
const bcrypt = require('bcryptjs'); // Для хеширования паролей
const { validationResult } = require('express-validator'); // Для обработки результатов валидации
const jwt = require('jsonwebtoken');

// Помощник для генерации JWT
function generarJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'clave_secreta', { expiresIn: '1h' });
}

// Вспомогательная функция для проверки аутентификации
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/auth/login'); // Перенаправляем на страницу входа, если не аутентифицирован
}

// Вспомогательная функция для проверки роли администратора
function isAdmin(req, res, next) {
    if (req.session.userId && req.session.user.rol === 'admin') {
        return next();
    }
    res.status(403).send('Доступ запрещен. Требуются права администратора.'); // 403 Forbidden
}

// GET /auth/register
exports.getRegisterPage = (req, res) => {
    res.render('register', { title: 'Registrarse', errors: [], oldInput: {} });
};

// POST /auth/register
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('register', { // Возвращаем ошибки на страницу регистрации
            title: 'Регистрация',
            errors: errors.array(),
            oldInput: req.body // Сохраняем введенные данные
        });
    }

    const { empresa, nombre, apellidos, email, password, telefono, direccionEntrega } = req.body;

    try {
        // Проверка, существует ли уже пользователь с таким email
        const existingCliente = await Cliente.findOne({ where: { email } });
        if (existingCliente) {
            return res.status(400).render('register', {
                title: 'Registrarse',
                errors: [{ msg: 'Пользователь с таким email уже существует.' }],
                oldInput: req.body
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10); // 10 - "соль" для хеширования

        // Создание нового клиента (по умолчанию роль 'cliente')
        const newCliente = await Cliente.create({
            empresa: empresa || null, // Если пусто, то null
            nombre: nombre || null,
            apellidos: apellidos || null,
            email,
            contrasena: hashedPassword,
            telefono,
            direccionEntrega,
            rol: 'cliente' // По умолчанию регистрируем как клиента
        });

        // Создаем JWT
        const token = generarJWT({
            id: newCliente.id,
            email: newCliente.email,
            login: newCliente.email,
            role: newCliente.rol
        });

        // Кладем токен в httpOnly cookie
        res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 60 * 60 * 1000, // 1 час
        });

        req.session.userId = newCliente.id;
        req.session.user = { id: newCliente.id, email: newCliente.email, rol: newCliente.rol, nombre: newCliente.nombre || newCliente.empresa };
        req.session.save(() => {
             res.redirect('/client/dashboard'); // Перенаправить на панель клиента после регистрации
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).render('register', {
            title: 'Registrarse',
            errors: [{ msg: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.' }],
            oldInput: req.body
        });
    }
};

// GET /auth/login
exports.getLoginPage = (req, res) => {
    res.render('login', { title: 'Inicio', errors: [], oldInput: {} });
};

// POST /auth/login
exports.login = async (req, res) => {
    console.log('Login attempt, req.body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('login', {
            title: 'Inicio',
            errors: errors.array(),
            oldInput: req.body
        });
    }

    const { email, password } = req.body;

    try {
        const cliente = await Cliente.findOne({ where: { email } });

        if (!cliente) {
            return res.status(400).render('login', {
                title: 'Inicio',
                errors: [{ msg: 'Неверный email или пароль.' }],
                oldInput: req.body
            });
        }

        console.log('Пароль из базы:', cliente.contrasena);

        const isMatch = await bcrypt.compare(password, cliente.contrasena);
        console.log('Результат сравнения пароля:', isMatch);

        if (!isMatch) {
            return res.status(400).render('login', {
                title: 'Inicio',
                errors: [{ msg: 'Неверный email или пароль.' }],
                oldInput: req.body
            });
        }

        // Создаем JWT
    const token = generarJWT({ 
        id: cliente.id,
        email: cliente.email,
        login: cliente.email,
        role: cliente.rol
    });

    // Кладем токен в httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

        // Успешный вход, сохраняем ID пользователя и его роль в сессии
        req.session.userId = cliente.id;
        req.session.user = { id: cliente.id, email: cliente.email, rol: cliente.rol, nombre: cliente.nombre || cliente.empresa }; // Добавляем имя/компанию для отображения
        req.session.save(() => {
            // Перенаправление в зависимости от роли
            if (cliente.rol === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/client/dashboard');
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).render('login', {
            title: 'Inicio',
            errors: [{ msg: 'Произошла ошибка при входе. Пожалуйста, попробуйте снова.' }],
            oldInput: req.body
        });
    }
};

// GET выход
exports.logout = (req, res) => {
  res.clearCookie('token'); // Удаляем cookie с токеном
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе из сессии:', err);
      return res.status(500).send('Ошибка при выходе.');
    }
    res.redirect('/');
  });
};

// Экспортируем middleware для использования в других роутах
exports.isAuthenticated = isAuthenticated;
exports.isAdmin = isAdmin;