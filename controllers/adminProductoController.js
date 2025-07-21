// controllers/adminProductoController.js
const { Producto } = require('../models');

// Показать все продукты
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.render('admin/productos', {
      title: 'Gestión de Productos',
      productos,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo cargar productos', error });
  }
};

// Crear новый продукт
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const imagenUrl = req.file ? req.file.filename : null;

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).render('error', { title: 'Error', message: 'Precio inválido' });
    }

    await Producto.create({
      nombre: nombre.trim(),
      descripcion: descripcion && descripcion.trim() !== '' ? descripcion.trim() : null,
      precioUnitario: precioNum,
      stock: stock ? parseInt(stock) : 0,
      imagenUrl,
    });

    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo crear producto', error });
  }
};

// Удалить продукт
exports.eliminarProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    await Producto.destroy({ where: { id: productoId } });
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo eliminar producto', error });
  }
};

// Показать форму редактирования продукта
exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const productoId = req.params.productoId;
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).render('error', { title: 'Error', message: 'Producto no encontrado' });
    }
    res.render('admin/editar_producto', {
      title: `Editar Producto ${producto.nombre}`,
      producto,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar producto para editar:', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo cargar el producto', error });
  }
};

// Обработать обновление продукта
exports.actualizarProducto = async (req, res) => {
  try {
    const productoId = req.params.productoId;
    const { nombre, descripcion, precio, stock } = req.body;
    const nuevaImagen = req.file ? req.file.filename : null;

    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).render('error', { title: 'Error', message: 'Producto no encontrado' });
    }

    // Проверка имени
    if (!nombre || nombre.trim() === '') {
      return res.status(400).render('error', { title: 'Error', message: 'El nombre es obligatorio' });
    }

    producto.nombre = nombre.trim();

    // Описание
    producto.descripcion = descripcion && descripcion.trim() !== '' ? descripcion.trim() : null;

    // Цена
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).render('error', { title: 'Error', message: 'Precio inválido' });
    }
    producto.precioUnitario = precioNum;

    // Stock
    const stockNum = parseInt(stock, 10);
    producto.stock = !isNaN(stockNum) && stockNum >= 0 ? stockNum : 0;

    // Изображение — только если загружено новое
    if (nuevaImagen) {
      producto.imagenUrl = nuevaImagen;
    }

    await producto.save();

    res.redirect('/admin/productos');
  } catch (error) {
    console.error('No se pudo actualizar el producto', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo actualizar el producto', error });
  }
};