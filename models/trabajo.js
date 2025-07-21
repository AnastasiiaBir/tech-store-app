// models/trabajo.js
module.exports = (sequelize, DataTypes) => {
  const Trabajo = sequelize.define('Trabajo', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pedidoId: { // Внешний ключ
      type: DataTypes.INTEGER,
      unique: true, // Один заказ - одна работа
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        'Pedido recibido',
        'En proceso (preparación de envío)',
        'Completado (listo para envío)',
        'Enviado (en camino)',
        'Entregado'
      ),
      allowNull: false,
      defaultValue: 'Pedido recibido',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'trabajos', // Явно указываем имя таблицы в БД
    timestamps: true,
  });

  return Trabajo;
};