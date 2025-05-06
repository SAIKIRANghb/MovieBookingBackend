const Screen = require('../models/Screen');
const Slot = require('../models/Slot');
const Theatre = require('../models/Theatre');
const redisClient = require('../redisClient');

exports.createScreen = async (req, res) => {
  const { classInfo, screenNo, theatreId, dim, validSeats } = req.body;
  try {
    if (!theatreId) {
      return res.status(400).send({ message: 'Theatre ID is required.' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).send({ message: 'Theatre not found. Please provide a valid theatre ID.' });
    }

    const screen = new Screen({
      classInfo,
      screenNo,
      dim,
      theatre: theatreId,
      validSeats
    });

    await screen.save();

    // Invalidate specific caches
    try {
      await redisClient.del('screens');
      await redisClient.del(`screens:theatre:${theatreId}`);
      await redisClient.del(`screenNo:${screenNo}:theatre:${theatreId}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in createScreen:', redisError);
    }

    res.status(201).send(screen);
  } catch (error) {
    console.error('Error creating screen:', error);
    res.status(400).send({ message: 'Error creating screen', error });
  }
};

exports.getScreens = async (req, res) => {
  try {
    const cachedScreens = await redisClient.get('screens');
    if (cachedScreens) {
      console.log('Cache hit: all screens');
      return res.status(200).send(JSON.parse(cachedScreens));
    }

    console.log('Cache miss: all screens');
    const screens = await Screen.find();
    await redisClient.set('screens', JSON.stringify(screens), { EX: 30 });

    res.status(200).send(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    res.status(500).send(error);
  }
};

exports.getScreensByQuery = async (req, res) => {
  const { theatreId } = req.query;

  if (!theatreId) {
    return res.status(400).json({ message: 'theatreId is required' });
  }

  try {
    const cacheKey = `screens:theatre:${theatreId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: screens for theatre ${theatreId}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss: screens for theatre ${theatreId}`);
    const screens = await Screen.find({ theatre: theatreId });

    if (screens.length === 0) {
      return res.status(404).json({ message: 'No screens found' });
    }

    await redisClient.set(cacheKey, JSON.stringify(screens), { EX: 30 });
    res.status(200).json(screens);
  } catch (error) {
    console.error('Error fetching screens:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScreenByNo = async (req, res) => {
  const { screenNum, theatreId } = req.query;
  try {
    const cacheKey = `screenNo:${screenNum}:theatre:${theatreId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: screenNo:${screenNum}:theatre:${theatreId}`);
      return res.status(200).send(JSON.parse(cached));
    }

    console.log(`Cache miss: screenNo:${screenNum}:theatre:${theatreId}`);
    const screen = await Screen.find({
      screenNo: Number(screenNum),
      theatre: theatreId
    });
    if (!screen || screen.length === 0) {
      return res.status(404).send({ message: 'Screen not found' });
    }

    await redisClient.set(cacheKey, JSON.stringify(screen), { EX: 30 });
    res.status(200).send(screen);
  } catch (error) {
    console.error('Error fetching screen by number:', error);
    res.status(500).send(error);
  }
};

exports.getScreenById = async (req, res) => {
  const id = req.params.id;
  try {
    const cached = await redisClient.get(`screen:${id}`);
    if (cached) {
      console.log(`Cache hit: screen ${id}`);
      return res.status(200).send(JSON.parse(cached));
    }

    console.log(`Cache miss: screen ${id}`);
    const screen = await Screen.findById(id);
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }

    await redisClient.set(`screen:${id}`, JSON.stringify(screen), { EX: 30 });
    res.status(200).send(screen);
  } catch (error) {
    console.error('Error fetching screen by ID:', error);
    res.status(500).send(error);
  }
};

exports.updateScreen = async (req, res) => {
  try {
    // Fetch original screen for cache invalidation
    const originalScreen = await Screen.findById(req.params.id);
    if (!originalScreen) {
      return res.status(404).send({ message: 'Screen not found' });
    }

    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }

    // Invalidate specific caches
    try {
      await redisClient.del(`screen:${req.params.id}`);
      await redisClient.del('screens');
      await redisClient.del(`screens:theatre:${screen.theatre}`);
      await redisClient.del(`screenNo:${originalScreen.screenNo}:theatre:${originalScreen.theatre}`);
      await redisClient.del(`screenNo:${screen.screenNo}:theatre:${screen.theatre}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in updateScreen:', redisError);
    }

    res.status(200).send(screen);
  } catch (error) {
    console.error('Error updating screen:', error);
    res.status(400).send(error);
  }
};

exports.deleteScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).send({ message: 'Screen not found' });
    }

    // Fetch related slots for cache invalidation
    const slots = await Slot.find({ screen: screenId });

    // Delete screen and related slots
    await Screen.deleteOne({ _id: screenId });
    await Slot.deleteMany({ screen: screenId });

    // Invalidate specific caches
    try {
      // Invalidate screen caches
      await redisClient.del(`screen:${screenId}`);
      await redisClient.del('screens');
      await redisClient.del(`screens:theatre:${screen.theatre}`);
      await redisClient.del(`screenNo:${screen.screenNo}:theatre:${screen.theatre}`);

      // Invalidate slot caches
      for (const slot of slots) {
        await redisClient.del(`slot:${slot._id}`);
        await redisClient.del(`slots:${JSON.stringify({ movie: slot.movie, theatre: slot.theatre, screen: slot.screen, date: slot.date, time: slot.time })}`);
      }
      await redisClient.del('slots');
    } catch (redisError) {
      console.error('Redis cache invalidation error in deleteScreen:', redisError);
    }

    res.status(200).send({ message: 'Screen and related slots deleted' });
  } catch (error) {
    console.error('Error deleting screen:', error);
    res.status(500).send({ message: 'An error occurred while deleting the screen', error });
  }
};