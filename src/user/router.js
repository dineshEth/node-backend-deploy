import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getCurrentUser
} from './controllers/userController.js';

const userRouter = Router();

// Apply authentication middleware to all user routes
userRouter.use(authenticate);

// User routes
// Only admin can create users
userRouter.post('/', createUser);

// Only admin can get all users
userRouter.get('/', getAllUsers);

// Get current user profile (self)
userRouter.get('/me', getCurrentUser);

// Get specific user (admin or self)
userRouter.get('/:id', getUserById);

// Update user (admin or self)
userRouter.put('/:id', updateUser);

// Delete user (admin only)
userRouter.delete('/:id', deleteUser);

export default userRouter;
