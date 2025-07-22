// middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.log('verifyAdmin: no token found');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    if (decoded.role !== 'admin') {
      console.log('verifyAdmin: role is not admin:', decoded.role);
      return res.status(403).send('Se requieren derechos de administrador.');
    }

    req.user = decoded;
    console.log('verifyAdmin: success, user:', decoded);
    next();
  } catch (err) {
    console.error('Error de validación JWT:', err.message);
    return res.redirect('/auth/login');
  }
}

module.exports = verifyAdmin;