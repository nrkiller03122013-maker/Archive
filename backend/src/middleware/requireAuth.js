import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id firstname email isAdmin');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


