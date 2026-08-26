import { User } from '../user/models/User.js';
import { ROLES } from '../user/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Simple token-based authentication (can be replaced with JWT later)
const API_TOKENS = new Map();

/**
 * Generate a simple auth token for a user
 * @param {Object} user - User document
 * @returns {string} - Generated token
 */
export const generateToken = (user) => {
    // In production, use JWT or similar
    // For now, use a simple token based on user ID and timestamp
    const token = `${user._id}-${Date.now()}-${Math.random().toString(36).substr(2)}`;
    
    // Store token with user info
    API_TOKENS.set(token, {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: Date.now()
    });
    
    // Set token expiration (1 hour)
    setTimeout(() => {
        API_TOKENS.delete(token);
    }, 3600000);
    
    return token;
};

/**
 * Invalidate a token
 * @param {string} token - Token to invalidate
 */
export const invalidateToken = (token) => {
    API_TOKENS.delete(token);
};

/**
 * Get user from token
 * @param {string} token - Auth token
 * @returns {Object|null} - User info or null
 */
export const getUserFromToken = (token) => {
    return API_TOKENS.get(token) || null;
};

/**
 * Authentication middleware
 * Extracts user from Authorization header (Bearer token)
 * Sets req.user with user information
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required: Authorization header missing'
            });
        }
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format. Use: Bearer <token>'
            });
        }
        
        const token = parts[1];
        const userInfo = getUserFromToken(token);
        
        if (!userInfo) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        // Attach user info to request
        req.user = {
            id: userInfo.userId,
            username: userInfo.username,
            email: userInfo.email,
            role: userInfo.role
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Admin-only middleware
 * Only allows access if user is admin
 */
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    if (req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    
    next();
};

/**
 * Login endpoint to get token
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Find user by email (include password)
        const user = await User.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Invalidate any existing tokens for this user
        for (const [key, value] of API_TOKENS.entries()) {
            if (value.userId === user._id.toString()) {
                API_TOKENS.delete(key);
            }
        }
        
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No active session'
            });
        }
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(400).json({
                success: false,
                message: 'Invalid token format'
            });
        }
        
        const token = parts[1];
        invalidateToken(token);
        
        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};
