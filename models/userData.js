const mongoose = require('mongoose')

const logInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    admin: {
      type: Number,
      default: 0,
    },
    block: {
      type: Number,
      default: 0,
    }
  },
  {
    versionKey: false,
  }
);

const collection = mongoose.model('user', logInSchema);
module.exports = collection