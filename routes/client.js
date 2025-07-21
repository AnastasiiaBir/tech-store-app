// routes/client.js
var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController'); // Импортируем middleware
const { Producto } = require('../models'); // Импорт модели продукта
const clientController = require('../controllers/clientController');
const clientPedidoController = require('../controllers/clientPedidoController');

// Защищаем все роуты клиента: только аутентифицированный пользователь может получить доступ
router.use(authController.isAuthenticated);

// GET /client/dashboard
// router.get('/dashboard', function(req, res, next) {
//   res.render('client/dashboard', { title: 'Panel de Cliente', user: req.session.user }); // Передаем данные пользователя
//});

// --- НОВЫЙ РОУТ ---
// GET /client/productos — каталог товаров
router.get('/dashboard', clientController.getDashboard);
router.get('/productos', clientController.getProductos);
router.get('/mis-pedidos', clientPedidoController.getPedidos);

router.get('/mensajes/nuevo', clientController.getNuevoMensaje);
router.get('/mensajes', clientController.getMensajes);
router.get('/mensajes/:id', clientController.getMensajesDetalle);
router.get('/mensajes/detalle', clientController.getMensajesDetalle);

router.post('/mensajes/nuevo', clientController.postNuevoMensaje);

// 🔧 Управление заказами
router.post('/pedidos', clientPedidoController.realizarPedido);
router.post('/pedidos/:pedidoId/sumar/:productoId', clientPedidoController.sumarCantidad);
router.post('/pedidos/:pedidoId/restar/:productoId', clientPedidoController.restarCantidad);
router.post('/pedidos/:pedidoId/eliminar/:productoId', clientPedidoController.eliminarProductoDelPedido);
router.post('/pedidos/:pedidoId/pagar', clientPedidoController.pagarPedido);

const upload = require('../middleware/upload');

// Профиль клиента
router.get('/perfil', clientController.getPerfil);
router.post('/perfil', upload.single('fotoPerfil'), clientController.updatePerfil);

module.exports = router;