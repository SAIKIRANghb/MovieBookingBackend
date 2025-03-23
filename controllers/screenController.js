const Screen = require('../models/Screen');
const Slot = require('../models/Slot');
const Theatre = require('../models/Theatre');

exports.createScreen = async (req, res) => {
  const { classInfo, screenNo,theatreId,dim,validSeats } = req.body;
  try {
    // Check if the theatre ID is provided
    if (!theatreId) {
      return res.status(400).send({ message: 'Theatre ID is required.' });
    }

    // Find the theatre by ID
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found. Please provide a valid theatre ID.' });
    }

    // Create the screen
    const screen = new Screen({
      classInfo,
      screenNo,
      dim,
      theatre: theatreId,
      validSeats
    });

    res.status(201).send(screen);
  } catch (error) {
    res.status(400).send({ message: 'Error creating screen', error });
  }
};

exports.getScreens = async (req, res) => {
  try {
    const screens = await Screen.find();
    res.status(200).send(screens);
  } catch (error) {
    res.status(500).send(error);
  }
};
// Route to get screens based on screenId and theatreId
exports.getScreensByQuery = async (req, res) => {
  try {
    const {theatreId } = req.query;

    if (!theatreId) {
      return res.status(400).json({ message: 'theatreId is required' });
    }

    const screens = await Screen.find({theatre: theatreId });
    
    if (screens.length === 0) {
      return res.status(404).json({ message: 'No screens found' });
    }

    res.status(200).json(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScreenByNo = async (req, res) => {
  try {
    const screen = await Screen.find({ screenNo: Number(req.query.screenNum) ,theatre:req.query.theatreId}); // Use findOne for a single screen
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }
    res.status(200).send(screen);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id); // Use findOne for a single screen
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }
    res.status(200).send(screen);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.updateScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }
    res.status(200).send(screen);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    
    // Find the screen and its associated theatre
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }
    await Screen.deleteOne({_id:screenId});
    await Slot.deleteMany({screen:screenId});

    res.status(200).send({ message: 'Screen and related movies and slots deleted' });
  } catch (error) {
    console.error('Error deleting screen:', error);
    res.status(500).send({ message: 'An error occurred while deleting the screen', error });
  }
};
