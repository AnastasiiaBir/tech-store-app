// models/mensaje.js
module.exports = (sequelize, DataTypes) => {
  const Mensaje = sequelize.define('Mensaje', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    asunto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fechaEnvio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Установит текущее время
    },
    leidoAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    respuestaAdmin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaRespuestaAdmin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leidoCliente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    relacionadoConPedidoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remitente: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'cliente'
},
  }, {
    tableName: 'mensajes', // Явно указываем имя таблицы в БД
    timestamps: true,
  });

  return Mensaje;
};