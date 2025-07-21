const { Pedido, PedidoProducto, Producto } = require('../models');

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

// 📦 Показать все заказы пользователя
exports.getPedidos = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const pedidos = await Pedido.findAll({
      where: { clienteId: userId },
      include: [{
        model: PedidoProducto,
        as: 'items',
        include: [{ model: Producto, as: 'producto' }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.render('client/pedidos', {
      title: 'Mis Pedidos',
      user: req.session.user,
      pedidos
    });
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar pedidos', error });
  }
};

// 🛒 Добавить товар в заказ (или создать заказ)
exports.realizarPedido = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productoId = req.body.productoId;

    const producto = await Producto.findByPk(productoId);
    if (!producto) return res.status(404).send('Producto no encontrado');

    let pedido = await Pedido.findOne({
      where: { clienteId: userId, estadoPago: 'Sin liquidar'}
    });
    // Если нет активного заказа, создаем новый
    if (!pedido) {
      pedido = await Pedido.create({
        clienteId: userId,
        total: 0,
        estadoPago: 'Sin liquidar',
        montoPagado: 0
      });
    }
    // Проверить наличие товара в заказе
    let pedidoProducto = await PedidoProducto.findOne({
      where: { pedidoId: pedido.id, productoId}
    });

    if (pedidoProducto) {
      pedidoProducto.cantidad += 1;
      await pedidoProducto.save();
    } else {
      await PedidoProducto.create({
        pedidoId: pedido.id,
        productoId,
        cantidad: 1,
        precioUnitarioAlMomento: producto.precioUnitario
      });
    }

    await actualizarTotalPedido(pedido.id);
    res.redirect('/client/mis-pedidos');
  } catch (error) {
    console.error('❌ Error al crear o actualizar el pedido:', error);
    res.status(500).send('Error al crear o actualizar el pedido');
  }
};

// ➕ Увеличить количество товара
exports.sumarCantidad = async (req, res) => {
  try {
    const { pedidoId, productoId } = req.params;
    const item = await PedidoProducto.findOne({ where: { pedidoId, productoId } });
    if (!item) return res.status(404).send('Producto no encontrado en el pedido');

    item.cantidad += 1;
    await item.save();

    await actualizarTotalPedido(pedidoId);
    res.redirect('/client/mis-pedidos');
  } catch (error) {
    console.error('Error al aumentar la cantidad:', error);
    res.status(500).send('Error al aumentar la cantidad');
  }
};

// ➖ Уменьшить количество товара
exports.restarCantidad = async (req, res) => {
  try {
    const { pedidoId, productoId } = req.params;
    const item = await PedidoProducto.findOne({ where: { pedidoId, productoId } });
    if (!item) return res.status(404).send('Producto no encontrado en el pedido');

    if (item.cantidad > 1) {
      item.cantidad -= 1;
      await item.save();
    } else {
      await item.destroy();
    }

    await actualizarTotalPedido(pedidoId);
    res.redirect('/client/mis-pedidos');
  } catch (error) {
    console.error('Error al reducir la cantidad:', error);
    res.status(500).send('Error al reducir la cantidad');
  }
};

// 🗑 Удалить товар из заказа
exports.eliminarProductoDelPedido = async (req, res) => {
  try {
    const { pedidoId, productoId } = req.params;
    const item = await PedidoProducto.findOne({ where: { pedidoId, productoId } });
    if (!item) return res.status(404).send('Producto no encontrado en el pedido');

    await item.destroy();
    await actualizarTotalPedido(pedidoId);
    res.redirect('/client/mis-pedidos');
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error al eliminar el producto del pedido');
  }
};

// 💳 Оплатить заказ
exports.pagarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) return res.status(404).send('Pedido no encontrado');

    pedido.estadoPago = 'Pagado';
    pedido.montoPagado = pedido.total;
    await pedido.save();

    res.redirect('/client/mis-pedidos');
  } catch (error) {
    console.error('Error al pagar el pedido:', error);
    res.status(500).send('Error al pagar el pedido');
  }
};

// 🔄 Вспомогательная функция: пересчёт суммы
async function actualizarTotalPedido(pedidoId) {
  const items = await PedidoProducto.findAll({ where: { pedidoId } });
  let total = 0;
  for (const item of items) {
    total += item.cantidad * parseFloat(item.precioUnitarioAlMomento);
  }

  const pedido = await Pedido.findByPk(pedidoId);
  pedido.total = total;
  await pedido.save();
}