const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connect = mongoose.connect(process.env.MONGO_URI);
const PORT = process.env.PORT;
// Check database connected or not
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch(() => {
    console.log("Database cannot be Connected");
  });

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
const collection = new mongoose.model("users", userSchema);

module.exports = { collection, PORT };
