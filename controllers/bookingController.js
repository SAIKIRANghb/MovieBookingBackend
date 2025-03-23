const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
// Get all bookings
exports.getBookings = async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getBookingsFromJWT = async (req, res) => {
    try {
      // Get the token from the request headers
      const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer <token>'
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
      }
  
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.API_SECRET); // Replace `process.env.JWT_SECRET` with your actual secret
  
      // Extract userId from the token
      const userId = decoded.userId;
      if (!userId) {
        return res.status(400).json({ message: 'Invalid token: userId not found' });
      }
  
      // Fetch bookings for the user
      const userBookings = await Booking.find({ userId });
      res.status(200).json(userBookings);
    } catch (error) {
      console.error('Error in getUsersFromJWT:', error);
      res.status(500).json({ message: error.message });
    }
  };
  // Get a booking by ID
  exports.getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update a booking
  exports.updateBooking = async (req, res) => {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Delete a booking
  exports.deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.status(200).json({ message: 'Booking deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  