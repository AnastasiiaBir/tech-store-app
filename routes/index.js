  // routes/index.js
var express = require('express');
var router = express.Router();
const { Producto } = require('../models'); // Подключаем модель

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.render('index', {
      title: 'Tech Store',
      productos,
      user: req.session.user
    });
  } catch (error) {
    console.error('❌ Error al cargar productos en la página principal:', error);
    res.status(500).send('Error al cargar productos');
  }
});

module.exports = router;