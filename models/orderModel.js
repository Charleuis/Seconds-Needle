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
            required:true,
        },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    couponCode:{
        type:String,
        required:false
    },
    couponAmount:{
        type:Number,
        required:true
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
    delete:{
      type:String,
      default:"no"
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