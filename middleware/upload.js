// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Настройка хранилища
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/perfiles'); // каталог для фоток клиентов
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Фильтр по типу файлов
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, JPEG y PNG'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;