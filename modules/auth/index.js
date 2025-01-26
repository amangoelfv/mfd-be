import express from 'express';
import { authenticate, loginUser } from './apis.js';
import User from '../../models/user.js';

const router = express.Router();

// Register a user (for testing or admin setup only)
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await loginUser(email, password);
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
});


export default router;