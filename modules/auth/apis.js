import User from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Login function
export const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Middleware to verify token and role
export const authenticate = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      
      console.log("no token found, ")
      return res.status(401).json({ error: 'Unauthorized' });}

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      // Check if user has a valid role
      if (roles.length && !roles.includes(decoded.role)) {
        console.log("access, ", roles, decoded)
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (err) {
      console.log(err)
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
