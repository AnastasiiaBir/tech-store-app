// models/pedidoProducto.js
// Это связующая таблица для отношения "многие ко многим" между Pedido и Producto
module.exports = (sequelize, DataTypes) => {
  const PedidoProducto = sequelize.define('PedidoProducto', {
    pedidoId: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Часть составного первичного ключа
      allowNull: false,
    },
    productoId: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Часть составного первичного ключа
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioUnitarioAlMomento: { // Цена на момент заказа
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'pedidos_productos', // Явно указываем имя таблицы в БД
    timestamps: false, // Для связующих таблиц обычно не нужны timestamps
  });

  // --- 🔧 Добавляем ассоциации ---
  PedidoProducto.associate = (models) => {
    PedidoProducto.belongsTo(models.Pedido, {
      foreignKey: 'pedidoId',
      as: 'pedido',
    });

    PedidoProducto.belongsTo(models.Producto, {
      foreignKey: 'productoId',
      as: 'producto',
    });
  };

  return PedidoProducto;
};