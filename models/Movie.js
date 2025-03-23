const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Movie or Show
const movieSchema = new Schema({
  theatre: { type: Schema.Types.ObjectId, ref: 'Theatre', default: null },
  title: { type: String, required: true },
  imgSrc: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  cast: [
    {
      name: { type: String, required: true },
      img: { type: String, required: true }
    }
  ]
});

// Create the model from the schema
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
