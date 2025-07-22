// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    req.user = decoded; // можно использовать в контроллерах
    next();
  } catch (err) {
    return res.redirect('/auth/login');
  }
}

module.exports = verifyToken;