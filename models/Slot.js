const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Slot schema
const slotSchema = new Schema({
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', default: null },
  theatre: { type: Schema.Types.ObjectId, ref: 'Theatre', default: null },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Matches hr:min am/pm format (e.g., "02:30 pm" or "11:45 am")
        return /^(0?[1-9]|1[0-2]):[0-5][0-9] ?(AM|PM)$/i.test(v);
      },
      message: props => `${props.value} is not a valid time format. Use hr:min am/pm.`,
    },
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        // Check if the date is not in the past
        return v >= new Date().setHours(0, 0, 0, 0);
      },
      message: props => `${props.value} is a past date. Date must be today or in the future.`,
    },
  },
  screen: { type: Schema.Types.ObjectId, ref: 'Screen', default: null },
  selectedSeats: { type: [String], default: [] },
  classPrices: [
    {
      classNo: { type: Number, required: true }, // Corresponds to the classNo in Screen
      className: { type: String, required: true }, // Corresponds to the className in Screen
      price: { type: Number, required: true }, // Price for this class
    },
  ],
});

// Create the Slot model
const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
