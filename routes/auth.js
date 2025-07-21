// routes/auth.js
var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

// GET форма регистрации
router.get('/register', authController.getRegisterPage);
// POST регистрация нового клиента (самостоятельная регистрация)
router.post('/register', [
    check('email', 'Introduzca la correcta email').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    // Добавьте больше валидаций для других полей
], authController.register);

// GET форма входа
router.get('/login', authController.getLoginPage);
// POST вход пользователя
router.post('/login', [
    check('email', 'Introduzca la correcta email').isEmail(),
    check('password', 'La contraseña no puede estar vacía').notEmpty(),
], authController.login);

// GET выход
router.get('/logout', authController.logout);

module.exports = router;