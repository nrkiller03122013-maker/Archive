import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import User from '../models/User.js';

const router = Router();

router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  res.json({ users });
});

// Update user details
router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, email, isAdmin } = req.body;
    
    // Validate input
    if (!firstname || !email) {
      return res.status(400).json({ message: 'firstname and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use by another user' });
    }

    // Prevent admin from removing their own admin status
    if (req.user._id.toString() === id && isAdmin === false) {
      return res.status(400).json({ message: 'Cannot remove your own admin privileges' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstname, email, isAdmin: Boolean(isAdmin) },
      { new: true, select: '-passwordHash' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


