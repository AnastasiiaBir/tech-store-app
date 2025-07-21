// models/pedido.js
module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clienteId: { // Внешний ключ
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00, // Устанавливаем значение по умолчанию
    },
    estadoPago: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Sin liquidar', // Устанавливаем значение по умолчанию
    },
    montoPagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00, // Устанавливаем значение по умолчанию
    },
    estadoTrabajo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'En proceso', // Устанавливаем значение по умолчанию
    },
  }, {
    tableName: 'pedidos', // Явно указываем имя таблицы в БД
    timestamps: true,
  });

   // 🔁 Связи с другими таблицами
  Pedido.associate = function(models) {
    Pedido.belongsTo(models.Cliente, { foreignKey: 'clienteId' });

    // Один заказ может содержать несколько строк в связующей таблице PedidoProducto
    Pedido.hasMany(models.PedidoProducto, {
      foreignKey: 'pedidoId',
      as: 'items' // alias, можно использовать при include
    });
  };

  return Pedido;
};