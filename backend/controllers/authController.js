const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, isAdmin } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists' });
    
    user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User with this username already exists' });
    
    // Create new user
    user = new User({ username, email, password, phoneNumber: phoneNumber || "", isAdmin: isAdmin || false });
    await user.save();
    
    res.json({ msg: "User created successfully", user: { _id: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.status(401).json({ msg: 'Invalid email or password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: '7d' });
  res.json({ token, user: { _id: user._id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, isAdmin: user.isAdmin } });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email phoneNumber isAdmin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { phoneNumber, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update phone number if provided
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      if (user.password !== currentPassword) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({ 
      msg: "Profile updated successfully", 
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        phoneNumber: user.phoneNumber, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        phoneNumber: user.phoneNumber, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
