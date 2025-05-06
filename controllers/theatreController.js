const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const Slot = require('../models/Slot');
const redis = require('../redisClient');

exports.createTheatre = async (req, res) => {
  const { theatrename, location, theatreImglink } = req.body;

  try {
    const theatre = new Theatre({ theatrename, location, theatreImglink });
    await theatre.save();

    // Invalidate specific caches
    try {
      await redis.del('theatres');
      await redis.del(`theatreName:${theatrename}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in createTheatre:', redisError);
    }

    res.status(201).send(theatre);
  } catch (error) {
    console.error('Error creating theatre:', error);
    res.status(400).send(error);
  }
};

exports.getTheatres = async (req, res) => {
  try {
    const cachedTheatres = await redis.get('theatres');
    if (cachedTheatres) {
      console.log('Cache hit: theatres');
      return res.status(200).send(JSON.parse(cachedTheatres));
    }

    console.log('Cache miss: theatres');
    const theatres = await Theatre.find();
    await redis.set('theatres', JSON.stringify(theatres), 'EX', 30);

    res.status(200).send(theatres);
  } catch (error) {
    console.error('Error fetching theatres:', error);
    res.status(500).send(error);
  }
};

exports.getTheatre = async (req, res) => {
  const id = req.params.id;
  try {
    const cachedTheatre = await redis.get(`theatre:${id}`);
    if (cachedTheatre) {
      console.log(`Cache hit: theatre:${id}`);
      return res.status(200).send(JSON.parse(cachedTheatre));
    }

    console.log(`Cache miss: System, with a cache miss for theatre:${id}`);
    const theatre = await Theatre.findById(id);
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }

    await redis.set(`theatre:${id}`, JSON.stringify(theatre), 'EX', 30);
    res.status(200).send(theatre);
  } catch (error) {
    console.error('Error fetching theatre:', error);
    res.status(500).send(error);
  }
};

exports.updateTheatre = async (req, res) => {
  try {
    // Fetch original theatre for cache invalidation
    const originalTheatre = await Theatre.findById(req.params.id);
    if (!originalTheatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }

    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }

    // Invalidate specific caches
    try {
      await redis.del(`theatre:${req.params.id}`);
      await redis.del('theatres');
      await redis.del(`theatreName:${originalTheatre.theatrename}`);
      await redis.del(`theatreName:${theatre.theatrename}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in updateTheatre:', redisError);
    }

    res.status(200).send(theatre);
  } catch (error) {
    console.error('Error updating theatre:', error);
    res.status(400).send(error);
  }
};

exports.deleteTheatre = async (req, res) => {
  try {
    const theatreId = req.params.id;
    const theatre = await Theatre.findById(theatreId);

    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }

    // Fetch related entities for cache invalidation
    const screens = await Screen.find({ theatre: theatreId });
    const movies = await Movie.find({ theatre: theatreId });
    const slots = await Slot.find({ theatre: theatreId });

    // Delete theatre and related entities
    await Theatre.deleteOne({ _id: theatreId });
    await Movie.deleteMany({ theatre: theatreId });
    await Slot.deleteMany({ theatre: theatreId });
    await Screen.deleteMany({ theatre: theatreId });

    // Invalidate specific caches
    try {
      // Invalidate theatre caches
      await redis.del(`theatre:${theatreId}`);
      await redis.del('theatres');
      await redis.del(`theatreName:${theatre.theatrename}`);

      // Invalidate screen caches
      for (const screen of screens) {
        await redis.del(`screen:${screen._id}`);
        await redis.del(`screenNo:${screen.screenNo}:theatre:${theatreId}`);
      }
      await redis.del(`screens:theatre:${theatreId}`);
      await redis.del('screens');

      // Invalidate movie caches
      for (const movie of movies) {
        await redis.del(`movie:${movie._id}`);
        await redis.del(`movieName:${movie.title}`);
        await redis.del(`movies:${theatreId}:${movie.screen || ''}`);
      }
      await redis.del(`movies:${theatreId}`);
      await redis.del('movies');

      // Invalidate slot caches
      for (const slot of slots) {
        await redis.del(`slot:${slot._id}`);
        await redis.del(`slots:${JSON.stringify({ movie: slot.movie, theatre: slot.theatre, screen: slot.screen, date: slot.date, time: slot.time })}`);
      }
      await redis.del('slots');
    } catch (redisError) {
      console.error('Redis cache invalidation error in deleteTheatre:', redisError);
    }

    res.status(200).send({ message: 'Theatre and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting theatre:', error);
    res.status(500).send({ error: 'Error deleting theatre and related data', details: error });
  }
};

exports.getTheatreByName = async (req, res) => {
  const name = req.params.name;
  try {
    const cachedTheatre = await redis.get(`theatreName:${name}`);
    if (cachedTheatre) {
      console.log(`Cache hit: theatreName:${name}`);
      return res.status(200).json(JSON.parse(cachedTheatre));
    }

    console.log(`Cache miss: theatreName:${name}`);
    const theatre = await Theatre.findOne({ theatrename: name });
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    await redis.set(`theatreName:${name}`, JSON.stringify(theatre), 'EX', 30);
    res.status(200).json(theatre);
  } catch (err) {
    console.error('Error fetching theatre by name:', err);
    res.status(500).json({ message: 'Error fetching theatre', error: err });
  }
};