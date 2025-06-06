const express = require('express');
const productController = require('../controllers/productController');
const sellerAuthController = require('../controllers/sellerAuthController');
const { checkProductOwnership } = require('../middleware/middleware');
const { uploadProductFiles } = require('../utils/multerConfig')

const router = express.Router();

router.use(sellerAuthController.protect);
router.post(
  '/',
  uploadProductFiles,
  productController.createProduct
);
router.get('/my-products', productController.getMyProducts);


router
  .route('/:id')
  .get(checkProductOwnership, productController.getProductById)
  .patch(
    uploadProductFiles,
    productController.editProductById
  )
  .delete(checkProductOwnership, productController.deleteProductById);

module.exports = router;

// const express = require('express');
// const productController = require('../controllers/productController');
// const sellerAuthController = require('../controllers/sellerAuthController');
// const { checkProductOwnership } = require('../middleware/middleware');
// const router = express.Router();

// router.use(sellerAuthController.protect);

// router.get('/my-products', productController.getMyProducts);

// router.post('/', productController.createProduct);

// router
//   .route('/:id')
//   .get(productController.getProductById)
//   .patch(checkProductOwnership, productController.editProductById)
//   .delete(checkProductOwnership, productController.deleteProductById);

// module.exports = router;
