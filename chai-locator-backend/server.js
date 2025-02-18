const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const ChaiSpotSchema = new mongoose.Schema({
  name: String,
  location: { type: { type: String }, coordinates: [Number] },
  rating: Number,
  parking: Boolean,
});

ChaiSpotSchema.index({ location: "2dsphere" });
const ChaiSpot = mongoose.model("ChaiSpot", ChaiSpotSchema);

// Create a new chai spot
app.post("/chai-spots", async (req, res) => {
  try {
    const { name, location, rating, parking } = req.body;
    const newSpot = new ChaiSpot({ name, location, rating, parking });
    await newSpot.save();
    res.status(201).json(newSpot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all chai spots
app.get("/chai-spots", async (req, res) => {
  try {
    const chaiSpots = await ChaiSpot.find();
    res.json(chaiSpots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a chai spot
app.put("/chai-spots/:id", async (req, res) => {
  try {
    const updatedSpot = await ChaiSpot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSpot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a chai spot
app.delete("/chai-spots/:id", async (req, res) => {
  try {
    await ChaiSpot.findByIdAndDelete(req.params.id);
    res.json({ message: "Chai spot deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch nearby chai spots using Google Maps API
app.get("/nearby-chai-spots", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    console.log("nearby-chai-spots", lat, lng);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=cafe&keyword=chai&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
