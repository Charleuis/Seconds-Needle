const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  products: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      Cartquantity:{
        type:Number,
        default:1,
        required:true,

    },
    },
  ],
  
},{versionKey:false});

module.exports = mongoose.model("cartDetails", cartSchema);

