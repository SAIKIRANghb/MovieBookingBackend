const redis = require('../redisClient');
const Slot = require("../models/Slot");
const Movie = require("../models/Movie");
const Screen = require("../models/Screen");
const Theatre = require("../models/Theatre");

exports.createSlot = async (req, res) => {
  const { movieId, theatreId, time, date, screenId, selectedSeats, classPrices } = req.body;

  try {
    const movie = await Movie.findById(movieId);
    const theatre = await Theatre.findById(theatreId);
    const screen = await Screen.findById(screenId);

    if (!movie || !theatre || !screen) {
      return res.status(404).send({ message: "Movie, Theatre, or Screen not found" });
    }

    // Validate date
    const today = new Date().setHours(0, 0, 0, 0);
    const slotDate = new Date(date).setHours(0, 0, 0, 0);
    if (slotDate < today) {
      return res.status(400).send({ message: "Date must be greater than or equal to today" });
    }

    // Validate classPrices
    if (!classPrices || !Array.isArray(classPrices)) {
      console.error("Invalid classPrices format:", classPrices);
      return res.status(400).send({ message: "Invalid classPrices. It must be an array of objects." });
    }

    // Create new slot
    const slot = new Slot({
      movie: movieId,
      theatre: theatreId,
      time,
      date,
      screen: screenId,
      selectedSeats,
      classPrices,
    });

    const savedSlot = await slot.save();

    // Invalidate specific caches
    try {
      await redis.del('slots');
      await redis.del(`slot:${savedSlot._id}`);
      await redis.del(`slots:${JSON.stringify({ movie: movieId, theatre: theatreId, screen: screenId, date, time })}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in createSlot:', redisError);
    }

    res.status(201).send(savedSlot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).send({ message: "Error creating slot", error });
  }
};

exports.getSlotsbyQuery = async (req, res) => {
  try {
    const { movieId, theatreId, screenId, time, date } = req.query;

    let query = { movie: movieId, theatre: theatreId };
    if (date) {
      const today = new Date().setHours(0, 0, 0);
      const queryDate = new Date(date).setHours(0, 0, 0, 0);
      if (queryDate < today) {
        return res.status(400).send({ message: "Date must be greater than or equal to today" });
      }
      query.date = date;
    }
    if (screenId) query.screen = screenId;
    if (time) query.time = time;

    // Check the cache first
    const cacheKey = `slots:${JSON.stringify(query)}`;
    const cachedSlots = await redis.get(cacheKey);

    if (cachedSlots) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).send(JSON.parse(cachedSlots));
    }

    console.log(`Cache miss: ${cacheKey}`);
    const slots = await Slot.find(query);

    await redis.set(cacheKey, JSON.stringify(slots), 'EX', 30);

    res.status(200).send(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).send(error);
  }
};

exports.getSlots = async (req, res) => {
  try {
    const cachedSlots = await redis.get('slots');

    if (cachedSlots) {
      console.log('Cache hit: all slots');
      return res.status(200).send(JSON.parse(cachedSlots));
    }

    console.log('Cache miss: all slots');
    const slots = await Slot.find();

    await redis.set('slots', JSON.stringify(slots), 'EX', 30);

    res.status(200).send(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).send(error);
  }
};

exports.getSlot = async (req, res) => {
  try {
    const slotId = req.params.id;

    const cachedSlot = await redis.get(`slot:${slotId}`);
    if (cachedSlot) {
      console.log(`Cache hit: slot:${slotId}`);
      return res.status(200).send(JSON.parse(cachedSlot));
    }

    console.log(`Cache miss: slot:${slotId}`);
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }

    await redis.set(`slot:${slotId}`, JSON.stringify(slot), 'EX', 30);

    res.status(200).send(slot);
  } catch (error) {
    console.error("Error fetching slot:", error);
    res.status(500).send(error);
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { date, movieId, theatreId, screenId, time } = req.body;
    if (date) {
      const today = new Date().setHours(0, 0, 0, 0);
      const slotDate = new Date(date).setHours(0, 0, 0, 0);
      if (slotDate < today) {
        return res.status(400).send({ message: "Date must be greater than or equal to today" });
      }
    }

    // Fetch original slot for cache invalidation
    const originalSlot = await Slot.findById(req.params.id);
    if (!originalSlot) {
      return res.status(404).send({ message: "Slot not found" });
    }

    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }

    // Invalidate specific caches
    try {
      await redis.del(`slot:${slot._id}`);
      await redis.del('slots');
      await redis.del(`slots:${JSON.stringify({ movie: originalSlot.movie, theatre: originalSlot.theatre, screen: originalSlot.screen, date: originalSlot.date, time: originalSlot.time })}`);
      await redis.del(`slots:${JSON.stringify({ movie: movieId || slot.movie, theatre: theatreId || slot.theatre, screen: screenId || slot.screen, date: date || slot.date, time: time || slot.time })}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in updateSlot:', redisError);
    }

    res.status(200).send(slot);
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(400).send(error);
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }

    // Delete slot
    await Slot.findByIdAndDelete(slotId);

    // Invalidate specific caches
    try {
      await redis.del(`slot:${slotId}`);
      await redis.del('slots');
      await redis.del(`slots:${JSON.stringify({ movie: slot.movie, theatre: slot.theatre, screen: slot.screen, date: slot.date, time: slot.time })}`);
    } catch (redisError) {
      console.error('Redis cache invalidation error in deleteSlot:', redisError);
    }

    res.status(200).send({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).send(error);
  }
};