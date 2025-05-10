const express = require('express');
const sellerAuthController = require('../controllers/sellerAuthController');
const sellerController = require('../controllers/sellerController');
const { uploadSellerProfile } = require('../utils/multerConfig');

const router = express.Router();

router.post('/login', sellerAuthController.login);
router.get('/', sellerController.getAllSellers);
router.get('/profile/:id', sellerController.getProfile);

router.use(sellerAuthController.protect);

router.patch(
    '/update-profile',
    uploadSellerProfile,
    sellerController.updateProfile
);
router.patch('/update-password', sellerAuthController.updatedPassword);


// router.get('/products', productController.getAllProducts);
// router.post('/products', productController.createProduct);
// router.get('/products/:id', productController.getProductById);
// router.patch('/products/:id', productController.editProductById);
// router.delete('/products/:id', productController.deleteProductById);

module.exports = router;