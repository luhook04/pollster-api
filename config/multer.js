const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const filename = uuidv4() + extension;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

module.exports = { upload };
