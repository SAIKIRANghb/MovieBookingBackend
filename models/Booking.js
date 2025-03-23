const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userId:{ type: Schema.Types.ObjectId, ref: 'User', default: null},
  theatrename:{type: String, required: true},
  screenNo : {type: String, required: true},
  movie: { type: Schema.Types.ObjectId, ref: 'User', default: null},
  theatre: { type: Schema.Types.ObjectId, ref: 'User', default: null},
  screen: { type: Schema.Types.ObjectId, ref: 'User', default: null},
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  selectedSeatCodeMap: { type: Map, of: String, required: true }, // Map of seatId ('0-2') -> human-readable code ('A1')
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
