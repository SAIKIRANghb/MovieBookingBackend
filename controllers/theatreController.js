const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const Slot = require('../models/Slot');

exports.createTheatre = async (req, res) => {
    const { theatrename, location ,theatreImglink} = req.body;
  
    try {
      const theatre = new Theatre({ theatrename, location ,theatreImglink});
      console.log(theatre)
      await theatre.save();
      res.status(201).send(theatre);
    } catch (error) {
      res.status(400).send(error);
    }
  };
  
exports.getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    res.status(200).send(theatres);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    // console.log(theatre)
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }
    res.status(200).send(theatre);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found' });
    }
    res.status(200).send(theatre);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteTheatre = async (req, res) => {
  try {
    const theatreId = req.params.id;

    // Fetch all screens related to the theatre
    await Theatre.deleteOne({_id:theatreId});
    await Screen.find({ theatre: theatreId });
    await Movie.deleteMany({theatre:theatreId});
    await Slot.deleteMany({theatre:theatreId});
    await Screen.deleteMany({theatre:theatreId});
    

    res.status(200).send({ message: 'Theatre and all related data (screens, movies, slots) deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error deleting theatre and related data', details: error });
  }
};

// Get a theatre by name
exports.getTheatreByName = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({ theatrename: req.params.name });
    // console.log(theatre)
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }
    res.status(200).json(theatre);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching theatre', error: err });
  }
};
