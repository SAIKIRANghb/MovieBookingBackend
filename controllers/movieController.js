const Movie = require('../models/Movie');
const Slot = require('../models/Slot');
const Theatre = require('../models/Theatre');
const redis = require('../redisClient');

exports.createMovie = async (req, res) => {
  const { title, imgSrc, description, genre, language, cast, theatreId } = req.body;
  try {
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }

    const movie = new Movie({
      title,
      imgSrc,
      description,
      genre,
      language,
      cast,
      theatre: theatreId,
    });

    await movie.save();

    // Invalidate specific caches
    try {
      await redis.del('movies');
      await redis.del(`movies:${theatreId}`);
      await redis.del(`movieName:${title}`);
      await redis.del(`movies:${theatreId}:`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in createMovie:', redisError);
    }

    res.status(201).send(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(400).send({ message: 'Error creating movie', error: error.message });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const cachedMovies = await redis.get('movies');
    if (cachedMovies) {
      console.log('Cache hit: movies');
      return res.status(200).send(JSON.parse(cachedMovies));
    }

    console.log('Cache miss: movies');
    const movies = await Movie.find();
    await redis.set('movies', JSON.stringify(movies), 'EX', 30);

    res.status(200).send(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).send(error);
  }
};

exports.getMoviesByTS = async (req, res) => {
  try {
    const { theatreId, screenId } = req.query;
    let query = { theatre: theatreId };
    if (screenId) {
      query.screen = screenId;
    }

    const cacheKey = `movies:${theatreId}:${screenId || ''}`;
    const cachedMovies = await redis.get(cacheKey);
    if (cachedMovies) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).send(JSON.parse(cachedMovies));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const movies = await Movie.find(query);
    await redis.set(cacheKey, JSON.stringify(movies), 'EX', 30);

    res.status(200).send(movies);
  } catch (error) {
    console.error('Error fetching movies by TS:', error);
    res.status(500).send(error);
  }
};

exports.getMoviesByQuery = async (req, res) => {
  try {
    const { theatreId, screenId } = req.query;
    let query = {};
    if (theatreId) query.theatre = theatreId;
    if (screenId) query.screen = screenId;

    const cacheKey = `movies:${theatreId || ''}:${screenId || ''}`;
    const cachedMovies = await redis.get(cacheKey);
    if (cachedMovies) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).send(JSON.parse(cachedMovies));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const movies = await Movie.find(query);
    await redis.set(cacheKey, JSON.stringify(movies), 'EX', 30);

    res.status(200).send(movies);
  } catch (error) {
    console.error('Error fetching movies by query:', error);
    res.status(500).send(error);
  }
};

exports.getMovieByName = async (req, res) => {
  try {
    const { name } = req.params;
    const cacheKey = `movieName:${name}`;
    const cachedMovie = await redis.get(cacheKey);
    if (cachedMovie) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedMovie));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const movie = await Movie.findOne({ title: name });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await redis.set(cacheKey, JSON.stringify(movie), 'EX', 30);
    res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie by name:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const cacheKey = `movie:${req.params.id}`;
    const cachedMovie = await redis.get(cacheKey);
    if (cachedMovie) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).send(JSON.parse(cachedMovie));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }

    await redis.set(cacheKey, JSON.stringify(movie), 'EX', 30);
    res.status(200).send(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).send(error);
  }
};

exports.updateMovie = async (req, res) => {
  try {
    // Fetch original movie for cache invalidation
    const originalMovie = await Movie.findById(req.params.id);
    if (!originalMovie) {
      return res.status(404).send({ message: 'Movie not found' });
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }

    // Invalidate specific caches
    try {
      await redis.del(`movie:${req.params.id}`);
      await redis.del('movies');
      await redis.del(`movies:${originalMovie.theatre}`);
      await redis.del(`movies:${movie.theatre}`);
      await redis.del(`movies:${originalMovie.theatre}:${originalMovie.screen || ''}`);
      await redis.del(`movies:${movie.theatre}:${movie.screen || ''}`);
      await redis.del(`movieName:${originalMovie.title}`);
      await redis.del(`movieName:${movie.title}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in updateMovie:', redisError);
    }

    res.status(200).send(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(400).send(error);
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }

    // Fetch related slots for cache invalidation
    const slots = await Slot.find({ movie: movieId, theatre: movie.theatre });

    // Delete movie and related slots
    await Slot.deleteMany({ theatre: movie.theatre, movie: movieId });
    await Movie.findByIdAndDelete(movieId);

    // Invalidate specific caches
    try {
      // Invalidate movie caches
      await redis.del(`movie:${movieId}`);
      await redis.del('movies');
      await redis.del(`movies:${movie.theatre}`);
      await redis.del(`movies:${movie.theatre}:${movie.screen || ''}`);
      await redis.del(`movieName:${movie.title}`);

      // Invalidate slot caches
      for (const slot of slots) {
        await redis.del(`slot:${slot._id}`);
        await redis.del(`slots:${JSON.stringify({ movie: slot.movie, theatre: slot.theatre, screen: slot.screen, date: slot.date, time: slot.time })}`);
      }
      await redis.del('slots');
    } catch (redisError) {
      console.error('Redis cache invalidation error in deleteMovie:', redisError);
    }

    res.status(200).send({ message: 'Movie and related slots deleted' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getMoviesByTheatre = async (req, res) => {
  try {
    const theatreId = req.query.theatreId;
    const cacheKey = `movies:${theatreId}`;
    const cachedMovies = await redis.get(cacheKey);
    if (cachedMovies) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedMovies));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const movies = await Movie.find({ theatre: theatreId });
    if (!movies.length) {
      return res.status(404).json({ message: 'No movies found for this theatre.' });
    }

    await redis.set(cacheKey, JSON.stringify(movies), 'EX', 30);
    res.status(200).json(movies);
  } catch (err) {
    console.error('Error fetching movies by theatre:', err);
    res.status(500).json({ message: 'Error fetching movies', error: err });
  }
};