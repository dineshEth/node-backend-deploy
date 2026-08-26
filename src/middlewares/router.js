import { Router } from 'express';
import { login, logout } from './auth.js';

const authRouter = Router();

// Authentication routes
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;
