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
      return res
        .status(404)
        .send({ message: "Movie, Theatre, or Screen not found" });
    }

    // Validate date
    const today = new Date().setHours(0, 0, 0, 0);
    const slotDate = new Date(date).setHours(0, 0, 0, 0);
    if (slotDate < today) {
      return res
        .status(400)
        .send({ message: "Date must be greater than or equal to today" });
    }

    // Validate classPrices
    if (!classPrices || !Array.isArray(classPrices)) {
      console.error("Invalid classPrices format:", classPrices);
      return res
        .status(400)
        .send({ message: "Invalid classPrices. It must be an array of objects." });
    }

    // Create new slot
    const slot = new Slot({
      movie: movieId,
      theatre: theatreId,
      time,
      date,
      screen: screenId,
      selectedSeats,
      classPrices, // Add classPrices to the slot
    });

    const savedSlot = await slot.save();

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
      const today = new Date().setHours(0, 0, 0, 0);
      const queryDate = new Date(date).setHours(0, 0, 0, 0);
      if (queryDate < today) {
        return res
          .status(400)
          .send({ message: "Date must be greater than or equal to today" });
      }
      query.date = date;
    }
    if (screenId) query.screen = screenId;
    if (time) query.time = time;

    const slots = await Slot.find(query);
    res.status(200).send(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).send(error);
  }
};

exports.getSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).send(slots);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }
    res.status(200).send(slot);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { date } = req.body;
    if (date) {
      const today = new Date().setHours(0, 0, 0, 0);
      const slotDate = new Date(date).setHours(0, 0, 0, 0);
      if (slotDate < today) {
        return res
          .status(400)
          .send({ message: "Date must be greater than or equal to today" });
      }
    }

    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }
    res.status(200).send(slot);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const deletedSlot = await Slot.findByIdAndDelete(slotId);
    if (!deletedSlot) {
      return res.status(404).send({ message: "Slot not found" });
    }
    res.status(200).send({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};
