const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Theatre
const theatreSchema = new Schema({
  theatrename: { type: String, required: true ,unique:true},
  location: { type: String, required: true },
  theatreImglink :{type: String, required: true}
});

// Create the model from the schema
const Theatre = mongoose.model('Theatre', theatreSchema);

module.exports = Theatre;
