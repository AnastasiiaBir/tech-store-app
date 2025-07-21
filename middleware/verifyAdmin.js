// middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    if (decoded.role !== 'admin') {
      return res.status(403).send('Se requieren derechos de administrador.');
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error de validación JWT:', err.message);
    return res.redirect('/login');
  }
}

module.exports = verifyAdmin;