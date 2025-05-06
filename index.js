// const express = require('express');
// const app = express();
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const PORT = process.env.PORT || 5001;
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const dotenv = require('dotenv');
// dotenv.config();

// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect(
//   "mongodb+srv://saikiransuguru:7eYEmWV5Nmzrn24m@cluster0.sbi4o.mongodb.net/TheatreDB?retryWrites=true&w=majority&appName=Cluster0",
//   { useNewUrlParser: true, useUnifiedTopology: true }
// )
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// // Import controllers and models
// const theatreController = require('./controllers/theatreController');
// const screenController = require('./controllers/screenController');
// const movieController = require('./controllers/movieController');
// const slotController = require('./controllers/slotController');
// const userController = require('./controllers/userController');
// const bookingController = require('./controllers/bookingController');
// const User = require('./models/User');
// const Booking = require('./models/Booking');
// const Slot = require('./models/Slot');

// // Middleware
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(cors());

// // Admin Middleware
// const isAdmin = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
//     if (err) {
//       console.error('JWT Error:', err.message);
//       return res.status(401).json({ message: 'Token is invalid or expired' });
//     }

//     try {
//       const user = await User.findById(decoded.userId);
//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });
//       }

//       // Check if the user is an admin
//       if (decoded.role !== 'admin') {
//         return res.status(403).json({ message: 'Access denied: Admins only' });
//       }

//       req.user = user; // Attach user info to request
//       next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
// };

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
//   if (!token) {
//     return res.status(401).json({ message: 'Authentication token is required' });
//   }

//   jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Invalid or expired token' });
//     }
//     req.user = decoded; // Attach decoded token data to the request object
//     console.log('decoded')
//     console.log(decoded)
//     next();
//   });
// };


// const verifyOwnershipOrAdmin = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Token is invalid or expired' });
//     }

//     try {
//       const user = await User.findById(decoded.userId);
//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });
//       }

//       // Allow access if the user is an admin or accessing their own profile
//       if (decoded.role === 'admin' || decoded.userId === req.params.id) {
//         req.user = user; // Attach user info to request
//         return next(); // Proceed to the next middleware or route handler
//       } else {
//         return res.status(403).json({ message: 'Access denied' });
//       }
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
// };


// // Theatre Routes
// app.post('/theatres', theatreController.createTheatre);
// app.get('/theatres', theatreController.getTheatres);
// app.get('/theatres/:id', theatreController.getTheatre);
// app.put('/theatres/:id', isAdmin, theatreController.updateTheatre); // Admin only
// app.delete('/theatres/:id', isAdmin, theatreController.deleteTheatre); // Admin only
// app.get('/theatres/name/:name', theatreController.getTheatreByName);

// // Screen Routes
// app.post('/screens', screenController.createScreen);
// app.get('/screens', screenController.getScreens);
// app.get('/screensQuery', screenController.getScreensByQuery);
// app.get('/screensbyNo', screenController.getScreenByNo);
// app.get('/screens/:id', screenController.getScreenById);
// app.put('/screens/:id', isAdmin, screenController.updateScreen); // Admin only
// app.delete('/screens/:id', isAdmin, screenController.deleteScreen); // Admin only

// // Movie Routes
// app.post('/movies', movieController.createMovie);
// app.get('/movies', movieController.getMovies);
// app.get('/moviesQuery', movieController.getMoviesByQuery);
// app.get('/movies/:id', movieController.getMovie);
// app.put('/movies/:id', isAdmin, movieController.updateMovie); // Admin only
// app.delete('/movies/:id', isAdmin, movieController.deleteMovie); // Admin only
// app.get('/moviesByTS', movieController.getMoviesByTS);
// app.get('/moviesByTheatre', movieController.getMoviesByTheatre);
// app.get('/movies/name/:name', movieController.getMovieByName);

// // Slot Routes
// app.post('/slots', slotController.createSlot);
// app.get('/slotsQuery', slotController.getSlotsbyQuery);
// app.get('/slots', slotController.getSlots);
// app.get('/slots/:id', slotController.getSlot);
// app.put('/slots/:id', isAdmin, slotController.updateSlot); // Admin only
// app.delete('/slots/:id', isAdmin, slotController.deleteSlot); // Admin only

// // User Routes
// app.get('/userdetails', userController.getUsersFromJWT);
// app.post('/user', userController.createUser);
// app.get('/user', isAdmin,userController.getUsers);
// app.get('/user/:id', verifyOwnershipOrAdmin,userController.getUserById);
// app.put('/user/:id', verifyOwnershipOrAdmin,userController.updateUser);
// app.delete('/user/:id', verifyOwnershipOrAdmin, userController.deleteUser);

// app.get('/bookingdetails',bookingController.getBookingsFromJWT);
// app.get('/bookings', isAdmin,bookingController.getBookings);
// app.get('/bookings/:id', isAdmin,bookingController.getBookingById);
// app.put('/bookings/:id', isAdmin,bookingController.updateBooking);
// app.delete('/bookings/:id', isAdmin, bookingController.deleteBooking);

// // Register Route
// app.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     // const isAdminEmail = email === "saikiransuguru@gmail.com";
//     // const role = isAdminEmail ? 'admin' : 'user';

//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     const token = jwt.sign({ userId: newUser._id, name: newUser.name }, process.env.API_SECRET, { expiresIn: '1h' });
//     res.status(201).json({ user: newUser, token });
//   } catch (error) {
//     console.error('Error during registration:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Login Route
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, process.env.API_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ user, token });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Token Verification
// app.post('/verify-token', (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Token is invalid or expired' });
//     }

//     try {
//       const user = await User.findById(decoded.userId);
//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
//       }
//       res.status(200).json(decoded);
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
// });





// app.post('/book', verifyToken, async (req, res) => {
//   try {
//     const {
//       movieId, theatreId, screenId, timeSlot, date,
//       selectedSeats, selectedSeatCodeMap, totalPrice,
//       screenNo, theatrename
//     } = req.body;

//     const slot = await Slot.findOne({
//       movie: movieId,
//       theatre: theatreId,
//       screen: screenId,
//       date,
//       time: timeSlot
//     });

//     if (!slot) {
//       return res.status(404).json({ error: 'Slot not found' });
//     }

//     // Check seat availability
//     const isAvailable = selectedSeats.every(seat => !slot.selectedSeats.includes(seat));
//     if (!isAvailable) {
//       return res.status(400).json({ error: 'Some seats are already booked' });
//     }

//     // Update slot with the selected seats
//     slot.selectedSeats.push(...selectedSeats);
//     await slot.save();

//     // Create a new booking
//     const booking = new Booking({
//       userId: req.user.userId, // Use userId from the decoded token
//       movie: movieId,
//       theatre: theatreId,
//       screen: screenId,
//       date,
//       timeSlot: timeSlot,
//       selectedSeats,
//       selectedSeatCodeMap,
//       totalPrice,
//       screenNo,
//       theatrename
//     });

//     await booking.save();

//     res.status(200).json({ message: 'Booking successful', booking });
//   } catch (error) {
//     console.error('Booking Error:', error);
//     res.status(500).json({ error: 'Booking failed' });
//   }
// });


// // Start Server
// // app.listen(PORT, '0.0.0.0', () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5001;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
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

// OpenAPI Specification
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Hotel & Table Management API",
    version: "1.0.0",
    description: "API for managing hotels and tables"
  },
  servers: [
    {
      url: "http://localhost:5001"
    }
  ],
  paths: {
    "/theatres": {
      post: {
        tags: ["Theatre"],
        summary: "Create a new theatre",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["theatrename", "location", "theatreImglink"],
                properties: {
                  theatrename: { type: "string", description: "Name of the theatre" },
                  location: { type: "string", description: "Location of the theatre" },
                  theatreImglink: { type: "string", description: "Image URL of the theatre" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Theatre created successfully" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      },
      get: {
        tags: ["Theatre"],
        summary: "Get all theatres",
        responses: {
          "200": {
            description: "List of theatres",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Theatre" }
                }
              }
            }
          }
        }
      }
    },
    "/theatres/{id}": {
      get: {
        tags: ["Theatre"],
        summary: "Get a theatre by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Theatre details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Theatre" }
              }
            }
          },
          "404": { description: "Theatre not found" }
        }
      },
      put: {
        tags: ["Theatre"],
        summary: "Update a theatre",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Theatre" }
            }
          }
        },
        responses: {
          "200": { description: "Theatre updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Theatre not found" }
        }
      },
      delete: {
        tags: ["Theatre"],
        summary: "Delete a theatre",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Theatre and related data deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Theatre not found" }
        }
      }
    },
    "/theatres/name/{name}": {
      get: {
        tags: ["Theatre"],
        summary: "Get a theatre by name",
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Theatre details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Theatre" }
              }
            }
          },
          "404": { description: "Theatre not found" }
        }
      }
    },
    "/screens": {
      post: {
        tags: ["Screen"],
        summary: "Create a new screen",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["classInfo", "screenNo", "theatreId", "dim", "validSeats"],
                properties: {
                  classInfo: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["classNo", "className"],
                      properties: {
                        classNo: { type: "number" },
                        className: { type: "string" }
                      }
                    }
                  },
                  screenNo: { type: "number" },
                  theatreId: { type: "string" },
                  dim: {
                    type: "object",
                    required: ["NumRows", "SeatsPerRow"],
                    properties: {
                      NumRows: { type: "number" },
                      SeatsPerRow: { type: "number" }
                    }
                  },
                  validSeats: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Screen created successfully" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      },
      get: {
        tags: ["Screen"],
        summary: "Get all screens",
        responses: {
          "200": {
            description: "List of screens",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Screen" }
                }
              }
            }
          }
        }
      }
    },
    "/screensQuery": {
      get: {
        tags: ["Screen"],
        summary: "Get screens by query parameters",
        parameters: [
          {
            name: "theatreId",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "List of screens",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Screen" }
                }
              }
            }
          },
          "404": { description: "No screens found" }
        }
      }
    },
    "/screensbyNo": {
      get: {
        tags: ["Screen"],
        summary: "Get screen by number",
        parameters: [
          {
            name: "screenNum",
            in: "query",
            required: true,
            schema: { type: "number" }
          },
          {
            name: "theatreId",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Screen details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Screen" }
              }
            }
          },
          "404": { description: "Screen not found" }
        }
      }
    },
    "/screens/{id}": {
      get: {
        tags: ["Screen"],
        summary: "Get a screen by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Screen details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Screen" }
              }
            }
          },
          "404": { description: "Screen not found" }
        }
      },
      put: {
        tags: ["Screen"],
        summary: "Update a screen",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Screen" }
            }
          }
        },
        responses: {
          "200": { description: "Screen updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Screen not found" }
        }
      },
      delete: {
        tags: ["Screen"],
        summary: "Delete a screen",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Screen and related data deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Screen not found" }
        }
      }
    },
    "/movies": {
      post: {
        tags: ["Movie"],
        summary: "Create a new movie",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "imgSrc", "description", "genre", "language", "cast", "theatreId"],
                properties: {
                  title: { type: "string" },
                  imgSrc: { type: "string" },
                  description: { type: "string" },
                  genre: { type: "string" },
                  language: { type: "string" },
                  cast: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["name", "img"],
                      properties: {
                        name: { type: "string" },
                        img: { type: "string" }
                      }
                    }
                  },
                  theatreId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Movie created successfully" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      },
      get: {
        tags: ["Movie"],
        summary: "Get all movies",
        responses: {
          "200": {
            description: "List of movies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Movie" }
                }
              }
            }
          }
        }
      }
    },
    "/moviesQuery": {
      get: {
        tags: ["Movie"],
        summary: "Get movies by query parameters",
        parameters: [
          {
            name: "theatreId",
            in: "query",
            required: false,
            schema: { type: "Lucstring" }
          },
          {
            name: "screenId",
            in: "query",
            required: false,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "List of movies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Movie" }
                }
              }
            }
          }
        }
      }
    },
    "/movies/{id}": {
      get: {
        tags: ["Movie"],
        summary: "Get a movie by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Movie details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Movie" }
              }
            }
          },
          "404": { description: "Movie not found" }
        }
      },
      put: {
        tags: ["Movie"],
        summary: "Update a movie",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Movie" }
            }
          }
        },
        responses: {
          "200": { description: "Movie updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Movie not found" }
        }
      },
      delete: {
        tags: ["Movie"],
        summary: "Delete a movie",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Movie and related slots deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Movie not found" }
        }
      }
    },
    "/movies/name/{name}": {
      get: {
        tags: ["Movie"],
        summary: "Get a movie by name",
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Movie details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Movie" }
              }
            }
          },
          "404": { description: "Movie not found" }
        }
      }
    },
    "/moviesByTS": {
      get: {
        tags: ["Movie"],
        summary: "Get movies by theatre and screen",
        parameters: [
          {
            name: "theatreId",
            in: "query",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "screenId",
            in: "query",
            required: false,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "List of movies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Movie" }
                }
              }
            }
          }
        }
      }
    },
    "/moviesByTheatre": {
      get: {
        tags: ["Movie"],
        summary: "Get movies by theatre",
        parameters: [
          {
            name: "theatreId",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "List of movies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Movie" }
                }
              }
            }
          },
          "404": { description: "No movies found for this theatre" }
        }
      }
    },
    "/slots": {
      post: {
        tags: ["Slot"],
        summary: "Create a new slot",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["movieId", "theatreId", "time", "date", "screenId", "classPrices"],
                properties: {
                  movieId: { type: "string" },
                  theatreId: { type: "string" },
                  time: { type: "string", pattern: "^(0?[1-9]|1[0-2]):[0-5][0-9] ?(AM|PM)$" },
                  date: { type: "string", format: "date" },
                  screenId: { type: "string" },
                  selectedSeats: {
                    type: "array",
                    items: { type: "string" }
                  },
                  classPrices: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["classNo", "className", "price"],
                      properties: {
                        classNo: { type: "number" },
                        className: { type: "string" },
                        price: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Slot created successfully" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      },
      get: {
        tags: ["Slot"],
        summary: "Get all slots",
        responses: {
          "200": {
            description: "List of slots",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Slot" }
                }
              }
            }
          }
        }
      }
    },
    "/slotsQuery": {
      get: {
        tags: ["Slot"],
        summary: "Get slots by query parameters",
        parameters: [
          {
            name: "movieId",
            in: "query",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "theatreId",
            in: "query",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "screenId",
            in: "query",
            required: false,
            schema: { type: "string" }
          },
          {
            name: "time",
            in: "query",
            required: false,
            schema: { type: "string" }
          },
          {
            name: "date",
            in: "query",
            required: false,
            schema: { type: "string", format: "date" }
          }
        ],
        responses: {
          "200": {
            description: "List of slots",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Slot" }
                }
              }
            }
          }
        }
      }
    },
    "/slots/{id}": {
      get: {
        tags: ["Slot"],
        summary: "Get a slot by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Slot details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Slot" }
              }
            }
          },
          "404": { description: "Slot not found" }
        }
      },
      put: {
        tags: ["Slot"],
        summary: "Update a slot",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Slot" }
            }
          }
        },
        responses: {
          "200": { description: "Slot updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Slot not found" }
        }
      },
      delete: {
        tags: ["Slot"],
        summary: "Delete a slot",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Slot deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Slot not found" }
        }
      }
    },
    "/book": {
      post: {
        tags: ["Booking"],
        summary: "Create a new booking",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "movieId", "theatreId", "screenId", "timeSlot", "date",
                  "selectedSeats", "selectedSeatCodeMap", "totalPrice", "screenNo", "theatrename"
                ],
                properties: {
                  movieId: { type: "string" },
                  theatreId: { type: "string" },
                  screenId: { type: "string" },
                  timeSlot: { type: "string" },
                  date: { type: "string", format: "date" },
                  selectedSeats: {
                    type: "array",
                    items: { type: "string" }
                  },
                  selectedSeatCodeMap: {
                    type: "object",
                    additionalProperties: { type: "string" }
                  },
                  totalPrice: { type: "number" },
                  screenNo: { type: "string" },
                  theatrename: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Booking successful" },
          "400": { description: "Invalid input or seats already booked" },
          "401": { description: "Unauthorized" },
          "404": { description: "Slot not found" }
        }
      }
    },
    "/bookings": {
      get: {
        tags: ["Booking"],
        summary: "Get all bookings",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of bookings",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Booking" }
                }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      }
    },
    "/bookings/{id}": {
      get: {
        tags: ["Booking"],
        summary: "Get a booking by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Booking details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Booking" }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - User or Admin access required" },
          "404": { description: "Booking not found" }
        }
      },
      put: {
        tags: ["Booking"],
        summary: "Update a booking",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Booking" }
            }
          }
        },
        responses: {
          "200": { description: "Booking updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Booking not found" }
        }
      },
      delete: {
        tags: ["Booking"],
        summary: "Delete a booking",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Booking deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" },
          "404": { description: "Booking not found" }
        }
      }
    },
    "/bookingdetails": {
      get: {
        tags: ["Booking"],
        summary: "Get user's bookings",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User's bookings",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Booking" }
                }
              }
            }
          },
          "401": { description: "Unauthorized" }
        }
      }
    },
    "/user": {
      post: {
        tags: ["User"],
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "User created successfully" },
          "400": { description: "Invalid input or user already exists" }
        }
      },
      get: {
        tags: ["User"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UserWallet" }
                }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin access required" }
        }
      }
    },
    "/user/{id}": {
      get: {
        tags: ["User"],
        summary: "Get a user by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "User details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserWallet" }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - User or Admin access required" },
          "404": { description: "User not found" }
        }
      },
      put: {
        tags: ["User"],
        summary: "Update a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserWallet" }
            }
          }
        },
        responses: {
          "200": { description: "User updated successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - User or Admin access required" },
          "404": { description: "User not found" }
        }
      },
      delete: {
        tags: ["User"],
        summary: "Delete a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "User deleted successfully" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - User or Admin access required" },
          "404": { description: "User not found" }
        }
      }
    },
    "/userdetails": {
      get: {
        tags: ["User"],
        summary: "Get user details from JWT",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserWallet" }
              }
            }
          },
          "401": { description: "Unauthorized" }
        }
      }
    },
    "/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/UserWallet" },
                    token: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input or user already exists" },
          "500": { description: "Internal server error" }
        }
      }
    },
    "/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/UserWallet" },
                    token: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid credentials" },
          "500": { description: "Internal server error" }
        }
      }
    },
    "/verify-token": {
      post: {
        tags: ["Authentication"],
        summary: "Verify JWT token",
        responses: {
          "200": {
            description: "Token is valid",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    name: { type: "string" },
                    role: { type: "string" }
                  }
                }
              }
            }
          },
          "401": { description: "Token is invalid or expired" },
          "500": { description: "Internal server error" }
        }
      }
    }
  },
  components: {
    schemas: {
      Booking: {
        type: "object",
        required: ["theatrename", "screenNo", "date", "timeSlot", "selectedSeatCodeMap", "totalPrice"],
        properties: {
          userId: { type: "string" },
          theatrename: { type: "string" },
          screenNo: { type: "string" },
          movie: { type: "string" },
          theatre: { type: "string" },
          screen: { type: "string" },
          date: { type: "string" },
          timeSlot: { type: "string" },
          selectedSeatCodeMap: {
            type: "object",
            additionalProperties: { type: "string" }
          },
          totalPrice: { type: "number" }
        }
      },
      UserWallet: {
        type: "object",
        properties: {
          Uid: { type: "string", description: "User ID" },
          email: { type: "string", format: "email", description: "User's email" },
          sports_bookings: {
            type: "array",
            items: { type: "string" },
            description: "List of sport booking IDs"
          }
        }
      },
      Theatre: {
        type: "object",
        required: ["theatrename", "location", "theatreImglink"],
        properties: {
          theatrename: { type: "string", description: "Name of the theatre" },
          location: { type: "string", description: "Location of the theatre" },
          theatreImglink: { type: "string", description: "Image URL of the theatre" }
        }
      },
      Screen: {
        type: "object",
        required: ["classInfo", "dim", "screenNo", "theatre"],
        properties: {
          classInfo: {
            type: "array",
            items: {
              type: "object",
              required: ["classNo", "className"],
              properties: {
                classNo: { type: "number" },
                className: { type: "string" }
              }
            }
          },
          dim: {
            type: "object",
            required: ["NumRows", "SeatsPerRow"],
            properties: {
              NumRows: { type: "number" },
              SeatsPerRow: { type: "number" }
            }
          },
          validSeats: {
            type: "array",
            items: { type: "string" }
          },
          screenNo: { type: "number" },
          theatre: { type: "string" }
        }
      },
      Movie: {
        type: "object",
        required: ["title", "imgSrc", "description", "genre", "language"],
        properties: {
          theatre: { type: "string" },
          title: { type: "string" },
          imgSrc: { type: "string" },
          description: { type: "string" },
          genre: { type: "string" },
          language: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          cast: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "img"],
              properties: {
                name: { type: "string" },
                img: { type: "string" }
              }
            }
          }
        }
      },
      Slot: {
        type: "object",
        required: ["movie", "theatre", "time", "date", "screen"],
        properties: {
          movie: { type: "string" },
          theatre: { type: "string" },
          time: { type: "string", pattern: "^(0?[1-9]|1[0-2]):[0-5][0-9] ?(AM|PM)$" },
          date: { type: "string", format: "date" },
          screen: { type: "string" },
          selectedSeats: {
            type: "array",
            items: { type: "string" }
          },
          classPrices: {
            type: "array",
            items: {
              type: "object",
              required: ["classNo", "className", "price"],
              properties: {
                classNo: { type: "number" },
                className: { type: "string" },
                price: { type: "number" }
              }
            }
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
};

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Admin Middleware
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
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
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    console.log('decoded');
    console.log(decoded);
    next();
  });
};

const verifyOwnershipOrAdmin = async (req, res, next) => {
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
      if (decoded.role === 'admin' || decoded.userId === req.params.id) {
        req.user = user;
        return next();
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
app.post('/theatres', isAdmin, theatreController.createTheatre);
app.get('/theatres', theatreController.getTheatres);
app.get('/theatres/:id', theatreController.getTheatre);
app.put('/theatres/:id', isAdmin, theatreController.updateTheatre);
app.delete('/theatres/:id', isAdmin, theatreController.deleteTheatre);
app.get('/theatres/name/:name', theatreController.getTheatreByName);

// Screen Routes
app.post('/screens', isAdmin, screenController.createScreen);
app.get('/screens', screenController.getScreens);
app.get('/screensQuery', screenController.getScreensByQuery);
app.get('/screensbyNo', screenController.getScreenByNo);
app.get('/screens/:id', screenController.getScreenById);
app.put('/screens/:id', isAdmin, screenController.updateScreen);
app.delete('/screens/:id', isAdmin, screenController.deleteScreen);

// Movie Routes
app.post('/movies', isAdmin, movieController.createMovie);
app.get('/movies', movieController.getMovies);
app.get('/moviesQuery', movieController.getMoviesByQuery);
app.get('/movies/:id', movieController.getMovie);
app.put('/movies/:id', isAdmin, movieController.updateMovie);
app.delete('/movies/:id', isAdmin, movieController.deleteMovie);
app.get('/moviesByTS', movieController.getMoviesByTS);
app.get('/moviesByTheatre', movieController.getMoviesByTheatre);
app.get('/movies/name/:name', movieController.getMovieByName);

// Slot Routes
app.post('/slots', isAdmin, slotController.createSlot);
app.get('/slotsQuery', slotController.getSlotsbyQuery);
app.get('/slots', slotController.getSlots);
app.get('/slots/:id', slotController.getSlot);
app.put('/slots/:id', isAdmin, slotController.updateSlot);
app.delete('/slots/:id', isAdmin, slotController.deleteSlot);

// User Routes
app.get('/userdetails', verifyToken, userController.getUsersFromJWT);
app.post('/user', userController.createUser);
app.get('/user', isAdmin, userController.getUsers);
app.get('/user/:id', verifyOwnershipOrAdmin, userController.getUserById);
app.put('/user/:id', verifyOwnershipOrAdmin, userController.updateUser);
app.delete('/user/:id', verifyOwnershipOrAdmin, userController.deleteUser);

app.get('/bookingdetails', verifyToken, bookingController.getBookingsFromJWT);
app.get('/bookings', isAdmin, bookingController.getBookings);
app.get('/bookings/:id', verifyOwnershipOrAdmin, bookingController.getBookingById);
app.put('/bookings/:id', isAdmin, bookingController.updateBooking);
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
    console.log(token);
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
    const isAvailable = selectedSeats.every(seat => !slot.selectedSeats.includes(seat));
    if (!isAvailable) {
      return res.status(400).json({ error: 'Some seats are already booked' });
    }
    slot.selectedSeats.push(...selectedSeats);
    await slot.save();
    const booking = new Booking({
      userId: req.user.userId,
      movie: movieId,
      theatre: theatreId,
      screen: screenId,
      date,
      timeSlot,
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});