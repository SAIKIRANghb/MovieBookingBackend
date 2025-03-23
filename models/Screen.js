const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Screen
const screenSchema = new Schema({
  classInfo: [
    {
      classNo: { type: Number, required: true },
      className: { type: String, required: true }
    }
  ],  
  dim: {
    NumRows: { type: Number, required: true },
    SeatsPerRow: { type: Number, required: true }
  },
  validSeats: { type: [String]},
  screenNo: { type: Number, required: true},
  theatre: { type: Schema.Types.ObjectId, ref: 'Theatre', default: null }
});

// Create the model from the schema
const Screen = mongoose.model('Screen', screenSchema);

module.exports = Screen;
