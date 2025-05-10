const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Product name is required!"] },
    description: { type: String, required: [true, "Product description is required!"] },
    image: {
        type: [String],
        required: true,
        set: function (val) {
            if (!Array.isArray(val)) {
                throw new AppError('Images must be an array!', 400);
            }
            if (!val.every(item => typeof item === 'string')) {
                throw new AppError('Images array must only contain strings!', 400);
            }
            return val;
        },
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string');
            },
            message: 'Images must be an array of strings'
        }
    },
    price: {
        type: Number,
        required: [true, 'Product price is required!'],
        min: [0, 'Price must be at least 0']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, "Seller of product is required!"]
    },
    weight: {
        type: String,
        required: [true, 'Unit of measurement is required!']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required!'],
        min: [0, 'Quantity must be at least 0']
    },
    isAvailable: {
        type: Boolean,
        default: true,
        required: false
    },
    isOrganic: {
        type: Boolean,
        default: false,
        required: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
        required: false
    },
    count: {
        type: Number,
        default: 0,
        min: [0, 'Count cannot be negative'],
        required: false
    },
    productionLocation: {
        type: String,
        required: false
    },
    certificates: {
        type: [String],
        required: true,
        set: function (val) {
            if (!Array.isArray(val)) {
                throw new AppError('Certificates must be an array!', 400);
            }
            if (!val.every(item => typeof item === 'string')) {
                throw new AppError('Certificates array must only contain strings!', 400);
            }
            return val;
        },
        validate: {
            validator: function (value) {
                if (value === undefined || value === null) return true;
                return Array.isArray(value) &&
                    value.every(item => typeof item === 'string');
            },
            message: 'Certificates must be an array of strings'
        }
    },
    saleType: {
        type: String,
        enum: ['Online', 'Yerində'],
        required: false
    },
    returnable: {
        type: Boolean,
        default: false
    },
    salesPoint: {
        type: String,
        required: false
    },
    schedule: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
