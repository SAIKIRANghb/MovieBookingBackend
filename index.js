const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5001;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://saikiransuguru:7eYEmWV5Nmzrn24m@cluster0.sbi4o.mongodb.net/TheatreDB?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Import controllers and models
const theatreController = require('./controllers/theatreController');
const screenController = require('./controllers/screenController');
const movieController = require('./controllers/movieController');
const slotController = require('./controllers/slotController');
const userController = require('./controllers/userController');
const bookingController = require('./controllers/bookingController');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Slot = require('./models/Slot');

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Admin Middleware
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err.message);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if the user is an admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
      }

      req.user = user; // Attach user info to request
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded token data to the request object
    console.log('decoded')
    console.log(decoded)
    next();
  });
};


const verifyOwnershipOrAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Allow access if the user is an admin or accessing their own profile
      if (decoded.role === 'admin' || decoded.userId === req.params.id) {
        req.user = user; // Attach user info to request
        return next(); // Proceed to the next middleware or route handler
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};


// Theatre Routes
app.post('/theatres', theatreController.createTheatre);
app.get('/theatres', theatreController.getTheatres);
app.get('/theatres/:id', theatreController.getTheatre);
app.put('/theatres/:id', isAdmin, theatreController.updateTheatre); // Admin only
app.delete('/theatres/:id', isAdmin, theatreController.deleteTheatre); // Admin only
app.get('/theatres/name/:name', theatreController.getTheatreByName);

// Screen Routes
app.post('/screens', screenController.createScreen);
app.get('/screens', screenController.getScreens);
app.get('/screensQuery', screenController.getScreensByQuery);
app.get('/screensbyNo', screenController.getScreenByNo);
app.get('/screens/:id', screenController.getScreenById);
app.put('/screens/:id', isAdmin, screenController.updateScreen); // Admin only
app.delete('/screens/:id', isAdmin, screenController.deleteScreen); // Admin only

// Movie Routes
app.post('/movies', movieController.createMovie);
app.get('/movies', movieController.getMovies);
app.get('/moviesQuery', movieController.getMoviesByQuery);
app.get('/movies/:id', movieController.getMovie);
app.put('/movies/:id', isAdmin, movieController.updateMovie); // Admin only
app.delete('/movies/:id', isAdmin, movieController.deleteMovie); // Admin only
app.get('/moviesByTS', movieController.getMoviesByTS);
app.get('/moviesByTheatre', movieController.getMoviesByTheatre);
app.get('/movies/name/:name', movieController.getMovieByName);

// Slot Routes
app.post('/slots', slotController.createSlot);
app.get('/slotsQuery', slotController.getSlotsbyQuery);
app.get('/slots', slotController.getSlots);
app.get('/slots/:id', slotController.getSlot);
app.put('/slots/:id', isAdmin, slotController.updateSlot); // Admin only
app.delete('/slots/:id', isAdmin, slotController.deleteSlot); // Admin only

// User Routes
app.get('/userdetails', userController.getUsersFromJWT);
app.post('/user', userController.createUser);
app.get('/user', isAdmin,userController.getUsers);
app.get('/user/:id', verifyOwnershipOrAdmin,userController.getUserById);
app.put('/user/:id', verifyOwnershipOrAdmin,userController.updateUser);
app.delete('/user/:id', verifyOwnershipOrAdmin, userController.deleteUser);

app.get('/bookingdetails',bookingController.getBookingsFromJWT);
app.get('/bookings', isAdmin,bookingController.getBookings);
app.get('/bookings/:id', isAdmin,bookingController.getBookingById);
app.put('/bookings/:id', isAdmin,bookingController.updateBooking);
app.delete('/bookings/:id', isAdmin, bookingController.deleteBooking);

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const isAdminEmail = email === "saikiransuguru@gmail.com";
    // const role = isAdminEmail ? 'admin' : 'user';

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, name: newUser.name }, process.env.API_SECRET, { expiresIn: '1h' });
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, process.env.API_SECRET, { expiresIn: '1h' });
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Token Verification
app.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
      }
      res.status(200).json(decoded);
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
});





app.post('/book', verifyToken, async (req, res) => {
  try {
    const {
      movieId, theatreId, screenId, timeSlot, date,
      selectedSeats, selectedSeatCodeMap, totalPrice,
      screenNo, theatrename
    } = req.body;

    const slot = await Slot.findOne({
      movie: movieId,
      theatre: theatreId,
      screen: screenId,
      date,
      time: timeSlot
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check seat availability
    const isAvailable = selectedSeats.every(seat => !slot.selectedSeats.includes(seat));
    if (!isAvailable) {
      return res.status(400).json({ error: 'Some seats are already booked' });
    }

    // Update slot with the selected seats
    slot.selectedSeats.push(...selectedSeats);
    await slot.save();

    // Create a new booking
    const booking = new Booking({
      userId: req.user.userId, // Use userId from the decoded token
      movie: movieId,
      theatre: theatreId,
      screen: screenId,
      date,
      timeSlot: timeSlot,
      selectedSeats,
      selectedSeatCodeMap,
      totalPrice,
      screenNo,
      theatrename
    });

    await booking.save();

    res.status(200).json({ message: 'Booking successful', booking });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
});


// Start Server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
