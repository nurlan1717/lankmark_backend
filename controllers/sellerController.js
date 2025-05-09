const Seller = require('../models/sellerModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const { photoUpload } = require('../utils/multerConfig');


exports.uploadSellerPhoto = photoUpload.single('photo');

exports.createSeller = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('You must be logged in to create a seller', 401));
  }

  const { name, surname, email, sellerCategory, certificate, age, location, password } = req.body;

  if (!name || !surname || !email || !certificate || !age || !location || !password) {
    return next(new AppError('Please provide all required fields: name, surname, email, certificate, age, location, password', 400));
  }

  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    return next(new AppError('Seller with this email already exists.', 400));
  }

  let photoUrl = 'https://thumbs.dreamstime.com/b/default-profile-picture-icon-high-resolution-high-resolution-default-profile-picture-icon-symbolizing-no-display-picture-360167031.jpg';

  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file);
  }

  const sellerData = {
    name,
    surname,
    email,
    sellerCategory: sellerCategory || 'Fruits',
    certificate,
    age,
    location,
    photo: photoUrl,
    password,
    createdBy: req.user.id
  };

  const newSeller = await Seller.create(sellerData);

  newSeller.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      seller: newSeller
    }
  });
});

exports.getAllSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.find();

  res.status(200).json({
    status: 'success',
    results: sellers.length,
    data: sellers
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const sellerId = req.params.id ? req.params.id : req?.seller?.id;
  console.log('Seller ID:', sellerId);
  
  if (!sellerId) {
    return next(new AppError('Seller ID is missing in the request or parameters.', 400));
  }

  const seller = await Seller.findById(sellerId);

  if (!seller) {
    return next(new AppError('No seller found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: seller
  });
});



exports.updateProfile = catchAsync(async (req, res, next) => {
  try {
    if (req.body.password) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /update-password.",
          400
        )
      );
    }

    const filteredBody = filterObj(
      req.body,
      "name",
      "surname",
      "sellerCategory",
      "certificate",
      "age",
      "location"
    );

    if (req.file) {
      try {
        const uploadedPhotoUrl = await uploadToCloudinary(req.file);
        filteredBody.photo = uploadedPhotoUrl;
      } catch (err) {
        console.error("Failed to upload image:", err);
        return next(new AppError("Failed to upload image", 500));
      }
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      req.seller.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSeller) {
      console.warn("No seller found with ID:", req.seller.id);
      return next(new AppError("No seller found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        seller: updatedSeller,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    next(new AppError("Profil yenilənərkən gözlənilməz xəta baş verdi", 500));
  }
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};