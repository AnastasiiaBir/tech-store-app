const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
// Импорт моделей
const Cliente = require('./cliente')(sequelize, DataTypes);
const Pedido = require('./pedido')(sequelize, DataTypes);
const Producto = require('./producto')(sequelize, DataTypes);
const Trabajo = require('./trabajo')(sequelize, DataTypes);
const PedidoProducto = require('./pedidoProducto')(sequelize, DataTypes);
const Mensaje = require('./mensaje')(sequelize, DataTypes);

// --- 📌 Определение связей (ассоциаций) ---
const models = {
  Cliente,
  Pedido,
  Producto,
  Trabajo,
  PedidoProducto,
  Mensaje,
};

// Вызываем associate для всех моделей, если есть
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// --- Многие ко многим: заказы и товары через связующую таблицу PedidoProducto ---
Pedido.belongsToMany(Producto, {
  through: PedidoProducto,
  foreignKey: 'pedidoId',
  otherKey: 'productoId'
});
Producto.belongsToMany(Pedido, {
  through: PedidoProducto,
  foreignKey: 'productoId',
  otherKey: 'pedidoId'
});

// --- Прямые связи для удобства (не обязательно, но полезно) ---
PedidoProducto.belongsTo(Pedido, { foreignKey: 'pedidoId' });
PedidoProducto.belongsTo(Producto, { foreignKey: 'productoId' });

// --- Клиент и заказы ---
Cliente.hasMany(Pedido, { foreignKey: 'clienteId' });
Pedido.belongsTo(Cliente, { foreignKey: 'clienteId' });

// --- Заказ и работа (1 к 1) ---
Pedido.hasOne(Trabajo, { foreignKey: 'pedidoId', onDelete: 'CASCADE' });
Trabajo.belongsTo(Pedido, { foreignKey: 'pedidoId' });


// --- Прямые связи для удобства (не обязательно, но полезно) ---;
// Можно добавить обратные связи, если потребуется:
// Pedido.hasMany(PedidoProducto, { foreignKey: 'pedidoId' });
// Producto.hasMany(PedidoProducto, { foreignKey: 'productoId' });

// --- Клиент и сообщения ---
Cliente.hasMany(Mensaje, { foreignKey: 'clienteId' });
Mensaje.belongsTo(Cliente, { foreignKey: 'clienteId' });

// --- Заказ и сообщения (опционально) ---
Pedido.hasMany(Mensaje, { foreignKey: 'relacionadoConPedidoId' });
Mensaje.belongsTo(Pedido, { foreignKey: 'relacionadoConPedidoId' });

module.exports = {
  sequelize,
  ...models,
};