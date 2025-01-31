const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Type", typeSchema, "type");
