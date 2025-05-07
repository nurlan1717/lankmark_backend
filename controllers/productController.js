const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const uploadToCloudinary  = require('../utils/cloudinaryUpload');
const { photoUpload } = require('../utils/multerConfig');


exports.uploadProductPhotos = photoUpload.array('image', 10);

exports.getAllProducts = catchAsync(async (req, res, next) => {

  let filter = {};
  if (req.seller) {
    filter = { seller: req.seller.id }
  }


  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .search()
    .limitFields()
    .paginate();
  const allProducts = await features.query.populate(
    "seller",
    "firstname lastname email"
  );
  res.status(200).json({
    status: "success",
    data: allProducts,
  });
});


exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let query = Product.findById(id).populate(
    "seller",
    "name surname email profilePicture"
  );

  if (req.seller) {
    query = Product.findOne({ _id: id, seller: req.seller.id }).populate(
      "seller",
      "name surname email profilePicture"
    );
  }

  const product = await query;

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json(product);
});




exports.editProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (product.seller.toString() !== req.seller.id) {
    return next(new AppError("You do not have permission to update this product", 403));
  }

  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file));
      const photoUrls = await Promise.all(uploadPromises);
      req.body.image = photoUrls;
    } catch (err) {
      console.error("Error uploading photos:", err);
      return next(new AppError("Failed to upload product images", 500));
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).populate("seller", "name surname email profilePicture");

  res.status(200).json({
    status: "success",
    data: updatedProduct
  });
});






exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.body.seller) {
    if (req.seller && req.seller.id) {
      req.body.seller = req.seller.id;
    } else {
      console.error("No seller info found in request");
      return next(new AppError("No seller info found in request", 400));
    }
  } else {
    console.log("Seller provided in request body:", req.body.seller); 
  }

  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file));
      const photoUrls = await Promise.all(uploadPromises);
      req.body.image = photoUrls;
    } catch (err) {
      console.error("Error uploading photos:", err);
      return next(new AppError("Failed to upload product images", 500));
    }
  } else {
    console.log("No image files detected in the request."); 
    return next(new AppError("At least one product image is required", 400));
  }

  let newProduct;
  try {
    newProduct = await Product.create(req.body);
  } catch (err) {
    console.error("Error creating product:", err);
    return next(new AppError("Failed to create product", 500));
  }

  let populatedProduct;
  try {
    populatedProduct = await Product.findById(newProduct._id).populate(
      "seller",
      "name surname email photo"
    );
  } catch (err) {
    console.error("Error populating product:", err);
    return next(new AppError("Failed to populate product", 500));
  }

  res.status(201).json({
    status: "success",
    data: populatedProduct
  });
});






exports.deleteProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (product.seller.toString() !== req.seller.id) {
    return next(new AppError("You do not have permission to delete this product", 403));
  }

  await Product.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null
  });
});



exports.getMyProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ seller: req.seller._id });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});