// config/database.js
require('dotenv').config(); // Загружает переменные из .env

const { Sequelize } = require('sequelize');

// Создаем экземпляр Sequelize для подключения к нашей базе данных
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Имя базы данных
  process.env.DB_USER,      // Пользователь базы данных
  process.env.DB_PASSWORD,  // Пароль пользователя базы данных
  {
    host: process.env.DB_HOST, // Хост базы данных (обычно localhost)
    dialect: 'mysql',          // Тип базы данных
    logging: false,            // Отключить логирование SQL-запросов в консоль (можно включить для отладки)
    pool: {                    // Настройки пула соединений (для оптимизации)
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Проверяем подключение к базе данных
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
    process.exit(1); // Выходим из приложения, если не можем подключиться к БД
  }
}

// Экспортируем экземпляр Sequelize и функцию подключения
module.exports = { sequelize, connectToDatabase };