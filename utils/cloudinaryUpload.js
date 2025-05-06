const cloudinary = require('./cloudinary');

const uploadToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'sellers',
    resource_type: 'auto',
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' }
    ]
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;
