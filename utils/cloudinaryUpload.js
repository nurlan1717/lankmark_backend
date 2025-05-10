const cloudinary = require('./cloudinary');

const uploadToCloudinary = async (file, folderName = 'sellers') => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const options = {
    folder: folderName,
    resource_type: 'auto'
  };

  if (file.mimetype.startsWith('image')) {
    options.transformation = [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' }
    ];
  }

  const result = await cloudinary.uploader.upload(dataURI, options);

  return result.secure_url;
};

module.exports = uploadToCloudinary;
