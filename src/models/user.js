const mongoose = require("mongoose");

// Create Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rule: {
    type: Number,
    default: null,
  },
  id_company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  id_store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  status: {
    type: Number,
    required: true,
    enum: [0, 1], // 0=active, 1=noactive
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// collection part
const collection = new mongoose.model("users", userSchema, "users");

module.exports = { collection };
