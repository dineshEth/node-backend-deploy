import express from 'express';
import chatbotRouter from './api/chatbot/router.js';
import healthRouter from './api/health/router.js';
import cors from 'cors';


const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/chatbot', chatbotRouter);
app.use('/health', healthRouter);

export default app;