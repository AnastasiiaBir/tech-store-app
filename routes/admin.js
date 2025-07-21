// routes/admin.js
var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController'); // Импортируем middleware
const adminController = require('../controllers/adminController');
const adminProductoController = require('../controllers/adminProductoController');

const uploadProducto = require('../middleware/uploadProducto');

// Защищаем все роуты админки: только аутентифицированный админ может получить доступ
router.use(authController.isAuthenticated);
router.use(authController.isAdmin);

// GET /admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// --- Управление клиентами ---
router.get('/clientes', adminController.getClientes);

// --- Управление заказами ---
router.get('/pedidos', adminController.getPedidos);

// --- Просмотр сообщений ---
router.get('/mensajes', adminController.getMensajes);
router.get('/mensajes/:id', adminController.getMensajeDetalle);
router.get('/mensajes/cliente/:clienteId', adminController.getMensajesPorCliente);
router.post('/mensajes/:id/responder', adminController.postResponderMensaje);
router.post('/mensajes/enviar', adminController.postEnviarMensaje);

// Productos
router.get('/productos', adminProductoController.getProductos);

router.post('/productos/nuevo', uploadProducto.single('imagen'), adminProductoController.crearProducto);
router.post('/productos/eliminar/:productoId', adminProductoController.eliminarProducto);
router.get('/productos/editar/:productoId', adminProductoController.mostrarFormularioEditar);
router.post('/productos/editar/:productoId', uploadProducto.single('imagen'), adminProductoController.actualizarProducto);

router.post('/pedidos/:pedidoId/estado', adminController.actualizarEstadoPedido);

// Здесь будут другие роуты для админки (управление клиентами, продуктами, заказами и т.д.)
// Пример:
// router.get('/productos', adminController.getProductos);
// router.post('/productos/new', adminController.createProducto);

module.exports = router;