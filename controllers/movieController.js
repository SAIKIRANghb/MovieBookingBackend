const Movie = require('../models/Movie');
const Slot = require('../models/Slot');
const Theatre = require('../models/Theatre');

exports.createMovie = async (req, res) => {
  const { title, imgSrc, description, genre, language, cast, theatreId } = req.body;
  try {
    const theatre = await Theatre.findById(theatreId);

    if (!theatre) {
      return res.status(404).send({ message: 'Theatre or Screen not found' });
    }

    // Create the movie
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
    res.status(200).send(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(400).send({ message: 'Error creating movie', error: error.message });
  }
};



exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getMoviesByTS = async(req,res)=>{
  try {
    const {theatreId,screenId} = req.query;
    let query = {theatre : theatreId};
    if(screenId){
      query.screen = screenId;
    }
    const movies = await Movie.find(query);
    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send(error);
  }
}
exports.getMoviesByQuery = async(req,res)=>{
  try {
    const {theatreId ,screenId} = req.query;

    let query = {};
    if (theatreId) query.theatre = theatreId;
    if (screenId) query.screen = screenId;
    const movies = await Movie.find(query);
    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send(error);
  }
}
exports.getMovieByName = async (req, res) => {
  try {
    const { name } = req.params;
    const movie = await Movie.findOne({ title: name }); // Assuming your movie model has a 'title' field

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie by name:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.status(200).send(movie);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }
    res.status(200).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Find the movie by its ID
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found' });
    }

    const theatreId = movie.theatre;
    // const screenId = movie.screen;

    // Delete related slots
    await Slot.deleteMany({ theatre: theatreId, movie: movieId });
    
    // Delete the movie
    await Movie.findByIdAndDelete(movieId); // Use findByIdAndDelete to delete the movie

    res.status(200).send({ message: 'Movie and related slots deleted' });
  } catch (error) {
    console.error('Error deleting movie:', error); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};


exports.getMoviesByTheatre = async (req, res) => {
  try {
    const theatreId = req.query.theatreId; // No need to convert to ObjectId
    const movies = await Movie.find({ theatre: theatreId }); // Query by string

    if (!movies.length) {
      return res.status(404).json({ message: 'No movies found for this theatre.' });
    }

    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movies', error: err });
  }
};

