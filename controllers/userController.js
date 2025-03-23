const User = require('../models/User');

// Create a new user
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

// Get user details from JWT
exports.getUsersFromJWT = async (req, res) => {
  try {
    // Extract the token from the request header
    const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer <token>'
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    // Verify and decode the JWT
    const decoded = jwt.verify(token, process.env.API_SECRET); // Replace `process.env.JWT_SECRET` with your actual secret key

    // Extract userId from the decoded token
    const userId = decoded.userId;
  
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token: userId not found' });
    }
    
    // Fetch the user details from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the user information
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getUsersFromJWT:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role is 'user'
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: { name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    console.log(user)
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
