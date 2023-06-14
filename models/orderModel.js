const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
     products: [
        {
          productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
          },
          price:{
            type:Number,
            required:false
        },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    couponName:{
        type:String,
        required:false
    },
    couponAmount:{
        type:Number,
        required:false
    },
    totalAmount:{
        type:Number,
        required:true,
    },
    paymnetMethod:{
        type:String,
        required:true,
    },
    status:{
        type:String,
       default: "Pending",
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"useraddress",
        required:true,
    },
    orderDate:{
        type:Date,
        default:Date.now,
    },
    paymentStatus:{
        type:String,
        default:"Unpaid"
    }
},{versionKey:false});

module.exports = mongoose.model("orderDetails",orderSchema);