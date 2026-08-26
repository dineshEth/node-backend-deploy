/**
 * User response views/formats
 * Centralized place for formatting user data responses
 */

/**
 * Format user object for response (excludes sensitive data)
 * @param {Object} user - User document from database
 * @returns {Object} - Formatted user object
 */
export const formatUserResponse = (user) => {
    if (!user) return null;

    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdBy: user.createdBy,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

/**
 * Format multiple users for response
 * @param {Array} users - Array of user documents
 * @returns {Array} - Array of formatted user objects
 */
export const formatUsersResponse = (users) => {
    if (!users || !Array.isArray(users)) return [];

    return users.map(user => formatUserResponse(user));
};

/**
 * Format user creation success response
 * @param {Object} user - Created user document
 * @returns {Object} - Success response
 */
export const formatUserCreatedResponse = (user) => {
    return {
        success: true,
        message: 'User created successfully',
        user: formatUserResponse(user)
    };
};

/**
 * Format user fetch success response
 * @param {Object|Array} users - User(s) document
 * @param {string} message - Custom message
 * @returns {Object} - Success response
 */
export const formatUserFetchResponse = (users, message = 'User(s) fetched successfully') => {
    return {
        success: true,
        message,
        users: Array.isArray(users) ? formatUsersResponse(users) : [formatUserResponse(users)]
    };
};

/**
 * Format user update success response
 * @param {Object} user - Updated user document
 * @returns {Object} - Success response
 */
export const formatUserUpdateResponse = (user) => {
    return {
        success: true,
        message: 'User updated successfully',
        user: formatUserResponse(user)
    };
};

/**
 * Format user deletion success response
 * @param {Object} user - Deleted user document
 * @returns {Object} - Success response
 */
export const formatUserDeleteResponse = (user) => {
    return {
        success: true,
        message: 'User deleted successfully',
        user: formatUserResponse(user)
    };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Error response
 */
export const formatErrorResponse = (message, errors = []) => {
    return {
        success: false,
        message,
        errors
    };
};

/**
 * Format validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} - Validation error response
 */
export const formatValidationError = (errors) => {
    return {
        success: false,
        message: 'Validation failed',
        errors: errors.map(err => ({
            field: err.path || err.field,
            message: err.message
        }))
    };
};

/**
 * Format unauthorized response
 * @param {string} message - Error message
 * @returns {Object} - Unauthorized response
 */
export const formatUnauthorizedResponse = (message = 'Unauthorized: Admin access required') => {
    return {
        success: false,
        message
    };
};
