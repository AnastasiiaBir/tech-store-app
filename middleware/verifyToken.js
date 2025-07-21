// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    req.user = decoded; // можно использовать в контроллерах
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}

module.exports = verifyToken;