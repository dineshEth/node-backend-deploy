import express from 'express';
import chatbotRouter from './api/chatbot/router.js';
import healthRouter from './api/health/router.js';
import userRouter from './user/router.js';
import authRouter from './middlewares/router.js';
import { authenticate } from './middlewares/auth.js';
import cors from 'cors';


const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/chatbot', chatbotRouter);
app.use('/health', healthRouter);

// User and authentication routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Index route
app.get('/', (req, res) => {
    res.json({
        message: 'Node Deploy API',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            chatbot: '/api/chatbot'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

export default app;