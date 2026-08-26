import { User, ROLES } from '../models/User.js';
import {
    formatUserResponse,
    formatUsersResponse,
    formatUserCreatedResponse,
    formatUserFetchResponse,
    formatUserUpdateResponse,
    formatUserDeleteResponse,
    formatErrorResponse,
    formatValidationError,
    formatUnauthorizedResponse
} from '../views/userViews.js';

/**
 * Seed the database with super admin if it doesn't exist
 * Only runs once when the database is first connected
 */
export const seedSuperAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'dinesh.kumar@gmail.com' });
        
        if (!existingAdmin) {
            const superAdmin = new User({
                username: 'dinesh88',
                email: 'dinesh.kumar@gmail.com',
                password: 'Sirohi@2026',
                role: ROLES.ADMIN,
                createdBy: null // Super admin is created by system
            });

            await superAdmin.save();
            console.log('Super admin created successfully');
        }
    } catch (error) {
        console.error('Error seeding super admin:', error.message);
    }
};

/**
 * Check if current user is admin
 * @param {Object} req - Express request object
 * @returns {boolean} - True if user is admin
 */
const isAdminUser = (req) => {
    return req.user && req.user.role === ROLES.ADMIN;
};

/**
 * Create a new user (Admin only)
 * POST /api/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUser = async (req, res) => {
    try {
        // Only admin can create users
        if (!isAdminUser(req)) {
            return res.status(403).json(formatUnauthorizedResponse());
        }

        const { username, email, password, role } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json(
                formatErrorResponse('Username, email, and password are required')
            );
        }

        // Validate role (only admin or user allowed)
        if (role && !Object.values(ROLES).includes(role)) {
            return res.status(400).json(
                formatErrorResponse(`Role must be either '${ROLES.ADMIN}' or '${ROLES.USER}'`)
            );
        }

        // Check if username already exists
        const existingUsername = await User.usernameExists(username);
        if (existingUsername) {
            return res.status(400).json(
                formatErrorResponse('Username already exists')
            );
        }

        // Check if email already exists
        const existingEmail = await User.emailExists(email);
        if (existingEmail) {
            return res.status(400).json(
                formatErrorResponse('Email already exists')
            );
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            role: role || ROLES.USER,
            createdBy: req.user.id
        });

        await newUser.save();

        return res.status(201).json(formatUserCreatedResponse(newUser));
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json(formatValidationError(Object.values(error.errors)));
        }

        console.error('Error creating user:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to create user')
        );
    }
};

/**
 * Get all users (Admin only)
 * GET /api/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
    try {
        // Only admin can get all users
        if (!isAdminUser(req)) {
            return res.status(403).json(formatUnauthorizedResponse());
        }

        const users = await User.find().sort({ createdAt: -1 });
        
        return res.status(200).json(formatUserFetchResponse(users));
    } catch (error) {
        console.error('Error fetching users:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to fetch users')
        );
    }
};

/**
 * Get a specific user by ID (Admin or self)
 * GET /api/users/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is trying to access their own profile
        const isSelf = req.user && req.user.id === id;

        // Only admin or self can access user details
        if (!isAdminUser(req) && !isSelf) {
            return res.status(403).json(formatUnauthorizedResponse());
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json(
                formatErrorResponse('User not found')
            );
        }

        return res.status(200).json(formatUserFetchResponse(user));
    } catch (error) {
        console.error('Error fetching user:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to fetch user')
        );
    }
};

/**
 * Update a user (Admin or self - with restrictions)
 * PUT /api/users/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if user is trying to access their own profile
        const isSelf = req.user && req.user.id === id;

        // Only admin or self can update user
        if (!isAdminUser(req) && !isSelf) {
            return res.status(403).json(formatUnauthorizedResponse());
        }

        // Self cannot update their own role
        if (isSelf && updateData.role) {
            return res.status(403).json(
                formatUnauthorizedResponse('You cannot change your own role')
            );
        }

        // Validate role if provided
        if (updateData.role && !Object.values(ROLES).includes(updateData.role)) {
            return res.status(400).json(
                formatErrorResponse(`Role must be either '${ROLES.ADMIN}' or '${ROLES.USER}'`)
            );
        }

        // Check if updating username - ensure it's unique
        if (updateData.username) {
            const existingUser = await User.findOne({
                username: updateData.username,
                _id: { $ne: id }
            });
            if (existingUser) {
                return res.status(400).json(
                    formatErrorResponse('Username already exists')
                );
            }
        }

        // Check if updating email - ensure it's unique
        if (updateData.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: id }
            });
            if (existingUser) {
                return res.status(400).json(
                    formatErrorResponse('Email already exists')
                );
            }
        }

        // Remove sensitive fields
        delete updateData.password;
        delete updateData.createdBy;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json(
                formatErrorResponse('User not found')
            );
        }

        return res.status(200).json(formatUserUpdateResponse(updatedUser));
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json(formatValidationError(Object.values(error.errors)));
        }

        console.error('Error updating user:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to update user')
        );
    }
};

/**
 * Delete a user (Admin only - cannot delete self)
 * DELETE /api/users/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Only admin can delete users
        if (!isAdminUser(req)) {
            return res.status(403).json(formatUnauthorizedResponse());
        }

        // Prevent admin from deleting themselves
        if (req.user.id === id) {
            return res.status(400).json(
                formatErrorResponse('Admin cannot delete themselves')
            );
        }

        // Prevent deletion of super admin (dinesh88)
        const userToDelete = await User.findById(id);
        if (userToDelete && userToDelete.email === 'dinesh.kumar@gmail.com') {
            return res.status(400).json(
                formatErrorResponse('Super admin cannot be deleted')
            );
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json(
                formatErrorResponse('User not found')
            );
        }

        return res.status(200).json(formatUserDeleteResponse(deletedUser));
    } catch (error) {
        console.error('Error deleting user:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to delete user')
        );
    }
};

/**
 * Get current user profile
 * GET /api/users/me
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(
                formatErrorResponse('Not authenticated')
            );
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json(
                formatErrorResponse('User not found')
            );
        }

        return res.status(200).json(formatUserFetchResponse(user));
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        return res.status(500).json(
            formatErrorResponse('Failed to fetch current user')
        );
    }
};
