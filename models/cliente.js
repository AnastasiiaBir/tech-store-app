// models/cliente.js
module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    contrasena: { // Будет хранить хешированный пароль
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    direccionEntrega: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente',
    },
    fotoPerfil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'clientes', // Явно указываем имя таблицы в БД
    timestamps: true,
  });

  return Cliente;
};