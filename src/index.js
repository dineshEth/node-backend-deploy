import app from './app.js';
import { connectDB } from '../config/db.config.js';
import { seedSuperAdmin } from './user/controllers/userController.js';

const PORT = process.env.PORT || 3000;

// Start server with database connection
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Seed super admin if database is empty
        await seedSuperAdmin();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check endpoint: http://localhost:${PORT}/health`);
            console.log(`API Documentation: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

startServer();

