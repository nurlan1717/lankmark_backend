const multer = require('multer');
const AppError = require('./appError');

const multerStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Only images and PDFs are allowed!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.uploadProductFiles = upload.fields([
  { name: 'image', maxCount: 10 },
  { name: 'certificates', maxCount: 5 }
]);

exports.uploadSellerProfile = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('photo');


