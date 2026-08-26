import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// Define user roles
const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

// User schema
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [50, 'Username cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === ROLES.ADMIN;
};

// Static method to check if username exists
userSchema.statics.usernameExists = async function(username) {
    return await this.findOne({ username });
};

// Static method to check if email exists
userSchema.statics.emailExists = async function(email) {
    return await this.findOne({ email });
};

// Static method to get user by email
userSchema.statics.getUserByEmail = async function(email) {
    return await this.findOne({ email }).select('+password');
};

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Create and export the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export { User, ROLES };
