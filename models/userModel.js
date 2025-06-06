const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Ad alanı zorunludur!"],
        trim: true,
        minlength: [3, "Ad minimum 3 herf olmalıdır!"],
        maxlength: [18, "Ad maximum 18 herf olmalıdır!"],
        validate: {
            validator: function(v) {
                return /^[a-zA-ZəığüşöçƏIĞÜŞÖÇ]+$/.test(v);
            },
            message: "Ad yalnız hərflərdən ibarət olmalıdır!"
        }
    },
    lastname: {
        type: String,
        required: [true, "Soyad alanı zorunludur!"],
        trim: true,
        minlength: [3, "Soyad minimum 3 herf olmalıdır!"],
        maxlength: [18, "Soyad maximum 18 herf olmalıdır!"],
        validate: {
            validator: function(v) {
                return /^[a-zA-ZəığüşöçƏIĞÜŞÖÇ]+$/.test(v);
            },
            message: "Soyad yalnız hərflərdən ibarət olmalıdır!"
        }
    },
    email: {
        type: String,
        required: [true, "Email alanı zorunludur!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Lütfen geçerli bir email adresi giriniz!"]
    },
    photo: {
        type: String,
        default: 'https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg'
    },
    password: {
        type: String,
        required: [true, "Şifre alanı zorunludur!"],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Şifre tekrar alanı zorunludur!"],
        validate: {
            validator: function (confPass) {
                return confPass === this.password;
            },
            message: "Şifreler eşleşmiyor!"
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    phoneNumber: {
        type: String,
    },
    birthDate: {
        type: Date,
        validate: {
            validator: function (date) {
                if (!date) return true;
                const today = new Date();
                const birthDate = new Date(date);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    return age - 1 >= 16;
                }
                return age >= 16;
            },
            message: 'İstifadəçi ən azı 16 yaşında olmalıdır'
        }
    },
    city: String,
    district: String,
    active: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifyToken: String,
    emailVerifyExpires: Date,
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'seller', 'administrator'],
        select: false,
    },
    fullname: {
        type: String,
      },
      
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    id: false
});

userSchema.virtual('products', {
    ref: 'Product',
    foreignField: 'seller',
    localField: '_id'
});



userSchema.pre('save', function (next) {
    this.fullname = `${this.firstname} ${this.lastname}`;
    next();
});


userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.createEmailVerifyToken = function () {
    const verifyToken = crypto.randomBytes(32).toString('hex');
    this.emailVerifyToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');
    this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;

    return verifyToken;
};

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;