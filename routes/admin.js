// routes/admin.js
var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController'); // Импортируем middleware
const adminController = require('../controllers/adminController');
const adminProductoController = require('../controllers/adminProductoController');

const uploadProducto = require('../middleware/uploadProducto');

const exportController = require('../controllers/exportController'); // Добавили контроллер
console.log('exportController:', exportController);

const verifyAdmin = require('../middleware/verifyAdmin');

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

router.get('/exportar-productos/csv', verifyAdmin, exportController.exportarCSV);
router.get('/exportar-productos/pdf', verifyAdmin, exportController.exportarPDF);
router.get('/exportar-productos/excel', verifyAdmin, exportController.exportarExcel);

// 👤 Exportar clientes
router.get('/exportar-clientes/csv', verifyAdmin, exportController.exportarClientesCSV);
router.get('/exportar-clientes/pdf', verifyAdmin, exportController.exportarClientesPDF);
router.get('/exportar-clientes/excel', verifyAdmin, exportController.exportarClientesExcel);

// 🧾 Exportar pedidos
router.get('/exportar-pedidos/csv', verifyAdmin, exportController.exportarPedidosCSV);
router.get('/exportar-pedidos/pdf', verifyAdmin, exportController.exportarPedidosPDF);
router.get('/exportar-pedidos/excel', verifyAdmin, exportController.exportarPedidosExcel);

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