// models/producto.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imagenUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'productos', // Явно указываем имя таблицы в БД
    timestamps: true, // Добавили timestamps, чтобы Sequelize не ругался, если они есть в БД
  });

  return Producto;
};

// models/producto.js

module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imagenUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'productos', // Явно указываем имя таблицы в БД
    timestamps: true,
  });

  // --- Добавим связи (НОВАЯ ЧАСТЬ) ---
  Producto.associate = (models) => {
    // Один товар может быть связан с многими заказами через PedidoProducto
    Producto.belongsToMany(models.Pedido, {
      through: models.PedidoProducto,
      foreignKey: 'productoId',
      otherKey: 'pedidoId'
    });
  };

  return Producto;
};
