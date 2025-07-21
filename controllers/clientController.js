// controllers/clientController.js

const { Cliente, Producto, Pedido, PedidoProducto, Mensaje } = require('../models');

// --- Панель клиента ---
exports.getDashboard = (req, res) => {
  res.render('client/dashboard', {
    title: 'Panel de Cliente',
    user: req.session.user
  });
};

// --- Профиль клиента ---
exports.getPerfil = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.session.user.id);

    res.render('client/perfil', {
      title: 'Mi Perfil',
      cliente,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se puede cargar el perfil',
      error
    });
  }
};

exports.updatePerfil = async (req, res) => {
  try {
    const clienteId = req.session.user.id;

    const datos = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono,
      direccionEntrega: req.body.direccionEntrega,
    };

    if (req.file) {
      datos.fotoPerfil = '/uploads/perfiles/' + req.file.filename;
    }

    await Cliente.update(datos, { where: { id: clienteId } });

    // Обновляем сессию (если надо, необязательно)
    const clienteActualizado = await Cliente.findByPk(clienteId);
    req.session.user = clienteActualizado.get({ plain: true });

    res.redirect('/client/perfil');
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudo actualizar el perfil',
      error
    });
  }
};

// --- Каталог товаров ---
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
   res.render('client/productos', {
      title: 'Catálogo de Productos',
      productos,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar el catálogo de productos:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar productos', error });
  }
 };

// --- Мои заказы ---
 exports.getMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { clienteId: req.session.user.id },
      include: {
        model: Producto,
        through: { attributes: ['cantidad'] }
      }
    });

    res.render('client/pedidos', {
      title: 'Mis Pedidos',
      pedidos,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar los pedidos', error });
  }
 };

// --- Написать сообщение в поддержку ---
exports.getNuevoMensaje = async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      where: { clienteId: req.session.user.id },
      order: [['createdAt', 'ASC']]
    });

    res.render('client/mensajes_nuevo', {
      title: 'Nuevo Mensaje',
      user: req.session.user,
      mensajes
    });
  } catch (error) {
    console.error('Error al cargar el historial de mensajes:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al cargar el historial de mensajes',
      error
    });
  }
};

// --- Обработка отправки нового сообщения ---
exports.postNuevoMensaje = async (req, res) => {
  try {
    const { asunto, contenido } = req.body;
    const clienteId = req.session.user.id;

    await Mensaje.create({
      clienteId,
      asunto,
      contenido,
      remitente: 'cliente',
      relacionadoConPedidoId: null, // если не привязан к заказу
      estado: 'Pendiente'
    });

    res.redirect('/client/mensajes/nuevo');
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error al enviar el mensajeНе удалось отправить сообщение',
      error
    });
  }
};

exports.getMensajes = async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      where: { clienteId: req.session.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.render('client/mensajes_lista', {
      title: 'Mis Mensajes',
      mensajes,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error al cargar los mensajes:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pueden cargar los mensajes',
      error
    });
  }
};

exports.getMensajesDetalle = async (req, res) => {
  try {
    const clienteId = req.session.user.id;
    const mensajesCliente = await Mensaje.findAll({
      where: { clienteId },
      order: [['fechaEnvio', 'ASC']]
    });

    res.render('client/mensajes_detalle', {
      title: 'Mi conversación con soporte',
      user: req.session.user,
      mensajesCliente
    });
  } catch (error) {
    console.error('Error al cargar el cuadro de diálogo:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pueden cargar los mensajes',
      error
    });
  }
};