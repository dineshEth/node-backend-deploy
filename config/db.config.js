import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/node_deploy';

let connection = null;

/**
 * Database connection function
 * Establishes connection to MongoDB using Mongoose
 * @returns {Promise<Mongoose>} - Mongoose connection object
 */
export const connectDB = async () => {
    if (connection) {
        return connection;
    }

    try {
        connection = await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected successfully');
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
    if (connection) {
        await mongoose.disconnect();
        connection = null;
        console.log('MongoDB disconnected');
    }
};

/**
 * Get current database connection
 * @returns {Mongoose|Null} - Current connection or null
 */
export const getConnection = () => {
    return connection;
};

export default connectDB;
