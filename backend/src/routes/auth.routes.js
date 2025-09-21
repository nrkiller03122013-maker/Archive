import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_EXPIRES_IN = '7d';

function createToken(user) {
  return jwt.sign({ sub: user._id, email: user.email, firstname: user.firstname }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

router.post('/signup', async (req, res) => {
  try {
    const { firstname, email, password } = req.body;
    if (!firstname || !email || !password) {
      return res.status(400).json({ message: 'firstname, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstname, email, passwordHash });
    const token = createToken(user);
    res.status(201).json({
      user: { id: user._id, firstname: user.firstname, email: user.email, isAdmin: user.isAdmin },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createToken(user);
    res.json({ user: { id: user._id, firstname: user.firstname, email: user.email, isAdmin: user.isAdmin }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected user info endpoint
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: { id: req.user._id, firstname: req.user.firstname, email: req.user.email, isAdmin: req.user.isAdmin } });
});

export default router;


