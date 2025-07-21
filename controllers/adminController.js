// controllers/adminController.js
const { Producto, Cliente, Pedido, PedidoProducto, Mensaje } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    const productos = await Producto.findAll();

    res.render('admin/dashboard', {
      title: 'Panel de Administrador',
      user: req.session.user,
      productos
    });
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudo cargar la lista de productos',
      error
    });
  }
};

// --- Управление клиентами ---
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();

    res.render('admin/clientes', {
      title: 'Clientes Registrados',
      user: req.session.user,
      clientes
    });
  } catch (error) {
    console.error('❌ Error al cargar clientes:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudieron cargar los clientes',
      error
    });
  }
};

// --- Управление заказами ---
exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Producto,
          through: { attributes: ['cantidad'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/pedidos', {
      title: 'Todos los Pedidos',
      user: req.session.user,
      pedidos
    });
  } catch (error) {
    console.error('❌ Error al cargar pedidos:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudieron cargar los pedidos',
      error
    });
  }
};

// --- Просмотр сообщений поддержки ---
exports.getMensajes = async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      include: {
        model: Cliente,
        attributes: ['nombre', 'email']
      },
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/mensajes', {
      title: 'Mensajes de Soporte',
      user: req.session.user,
      mensajes
    });
  } catch (error) {
    console.error('❌ Error al cargar mensajes:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudieron cargar los mensajes',
      error
    });
  }
};

// Просмотр одного сообщения и форма ответа
exports.getMensajeDetalle = async (req, res) => {
  try {
    const mensaje = await Mensaje.findByPk(req.params.id, {
      include: { model: Cliente, attributes: ['id', 'nombre', 'email'] }
    });

    if (!mensaje) {
      return res.status(404).render('error', { title: 'Error', message: 'Mensaje no encontrado' });
    }

    // Получаем все сообщения между этим клиентом и админом
    const mensajesCliente = await Mensaje.findAll({
      where: { clienteId: mensaje.clienteId },
      order: [['fechaEnvio', 'ASC']]
    });

    res.render('admin/mensaje_detalle', {
      title: `Mensaje de ${mensaje.Cliente.nombre}`,
  user: req.session.user,
  mensaje,
  mensajesCliente,
  clienteId: mensaje.clienteId  // <-- ЭТО ВАЖНО
});
  } catch (error) {
    console.error('Error al cargar el mensaje:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar el mensaje', error });
  }
};

// Обработка ответа админа
exports.postResponderMensaje = async (req, res) => {
  try {
    const { respuestaAdmin } = req.body;
    const mensajeId = req.params.id;

    const mensaje = await Mensaje.findByPk(mensajeId);

    if (!mensaje) {
      return res.status(404).render('error', { title: 'Error', message: 'Mensaje no encontrado' });
    }

    mensaje.respuestaAdmin = respuestaAdmin;
    mensaje.fechaRespuestaAdmin = new Date();
    mensaje.leidoAdmin = true; // Можно отметить как прочитанное
    await mensaje.save();

    // TODO: здесь можно добавить отправку уведомления клиенту через WebSocket или email

    // Получаем io из app (нужно прокинуть его в req.app)
const io = req.app.get('io');

if (io) {
  io.to(`cliente_${mensaje.clienteId}`).emit('mensajeRespondido', {
    mensajeId: mensaje.id,
    respuestaAdmin: mensaje.respuestaAdmin,
    fechaRespuestaAdmin: mensaje.fechaRespuestaAdmin
  });
}

    res.redirect('/admin/mensajes');
  } catch (error) {
    console.error('Error al guardar la respuesta:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error al guardar la respuesta', error });
  }
};

exports.postEnviarMensaje = async (req, res) => {
  try {
    const { mensaje, clienteId } = req.body;

    if (!mensaje || !clienteId) {
      console.log('❗ Datos insuficientes para enviar');
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    await Mensaje.create({
      clienteId,
      remitente: 'admin',
      contenido: mensaje,
      fechaEnvio: new Date(),
      leidoAdmin: true
    });

    console.log('✅ Mensaje enviado correctamente a la base de datos');

    // Отправка уведомления клиенту через WebSocket (если используется)
    const io = req.app.get('io');
    if (io) {
      io.to(`cliente_${clienteId}`).emit('nuevoMensaje', {
        contenido: mensaje,
        remitente: 'admin',
        fechaEnvio: new Date()
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al enviar el mensaje:', error);
    return res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.getMensajesPorCliente = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;

    const mensajesCliente = await Mensaje.findAll({
      where: { clienteId },
      order: [['fechaEnvio', 'ASC']],
      include: {
        model: Cliente,
        attributes: ['nombre', 'email']
      }
    });

    res.render('admin/mensajes_por_cliente', {
      title: `Mensajes del cliente ${clienteId}`,
      user: req.session.user,
      mensajesCliente,
      clienteId
    });
  } catch (error) {
    console.error('❌ Error al cargar mensajes por cliente:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudieron cargar los mensajes del cliente',
      error
    });
  }
};

exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { estadoTrabajo } = req.body;

    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).render('error', { title: 'Error', message: 'Pedido no encontrado' });
    }

    pedido.estadoTrabajo = estadoTrabajo;
    await pedido.save();

    // Получаем io из app (Socket.IO)
    const io = req.app.get('io');
    if (io) {
      // Отправляем событие клиенту в комнату с именем "cliente_<clienteId>"
      io.to(`cliente_${pedido.clienteId}`).emit('actualizarEstadoPedido', {
        pedidoId: pedido.id,
        nuevoEstado: pedido.estadoTrabajo
      });
    }

    res.redirect('/admin/pedidos');
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).render('error', { title: 'Error', message: 'No se pudo actualizar el estado del pedido', error });
  }
};