const cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay')
const walletModel =require('../models/walletModel')

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const order = {
  placeOrder: async (req, res) => {
    try {
      console.log(req.body.paymentmethod);
      const address = req.body.address;
      const total = req.body.total;
      const payment = req.body.paymentmethod
      const user = req.session.user_id
      const coupon = req.body.coupon
      const couponAmount = req.body.discount

 
      let paymentStatus;

      if (payment === "Razorpay"||payment === "Wallet") {
        paymentStatus = "Paid";
      } else {
        paymentStatus = "Unpaid";
      }
      let flag = await checkStock(user);
      const Cart = await cart
        .findOne({ userid: user })
        .populate("products.productid");

      if (flag == 0) {
        const orderdetail = new Order({
          userid: user,
          totalAmount: total,
          paymnetMethod: payment,
          address: address,
          couponCode: coupon,
          couponAmount: couponAmount,
          paymentStatus: paymentStatus
        });

        Cart.products.forEach(async (product) => {
          // let price =product.price;
          let quantity = product.Cartquantity;
          let productid = product.productid;
          let price = product.productid.price

          orderdetail.products.push({ productid, quantity, price });

          await Product.updateOne(
            { _id: productid },
            { $inc: { quantity: -quantity } }
          );
        });

        const orderplaced = await orderdetail.save();
        if (payment == "Wallet") {
          await walletModel.updateOne(
            { userid:  user},
            {
              $inc: { balance: -orderplaced.totalAmount },
              $push: {
                orderDetails: {
                  orderid: orderplaced._id,
                  amount: orderplaced.totalAmount,
                  type: "Debited",
                },
              },
            },
            { new: true }
          );
        }
        const orderplaceid = orderplaced._id
        await cart.findOneAndDelete({ userid: user }).exec();

        res.send({ message: "1", orderplaceid });
      } else {
        res.send({ message: "0" });

      }
    } catch (error) {
      console.log(error.message);
    }
  },

  sucessPage: async (req, res) => {
    try {
      const userid = req.session.user_id
      const orderdetail = req.query.id
      const order = await Order.findOne({ _id: orderdetail }).populate("address").populate("products.productid").exec();
      console.log(order);
      res.render('sucess', { order: order, title: userid })
    } catch (error) {
      console.log(error.message);
    }
  },

  createOrder: async (req, res) => {
    try {
      const user = req.session.user_id;
      let amount = parseInt(req.body.amount) * 100;
      let flag = await checkStock(user);
      console.log(amount);
      if (flag == 0) {
        const options = {
          amount: amount,
          currency: "INR",
          receipt: "charleslouis@gmail.com",
        };
        razorpayInstance.orders.create(options, (err, order) => {
          if (!err) {
            console.log("test");
            res.status(200).send({
              success: true,
              msg: "Order Created",
              amount: amount,
              key_id: RAZORPAY_ID_KEY,
              contact: "7907779153",
              name: "charles Louis",
              email: "charleslouis@gmail.com",
              message: true,
            });
            const orderid = req.body.orderid;
            const order_update = Order.findByIdAndUpdate(
              { _id: orderid },
              { $set: { paymentStatus: "Paid" } }
            );
          } else {
            res
              .status(400)
              .send({
                message: true,
                success: false,
                msg: "Something went wrong!",
              });
          }
        });
      } else {
        res.status(200).send({ message: false, msg: "Some products are out of Stock" });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  returnrequest: async(req,res)=>{
    try {
      let orderid = req.body.id;
      let order = await Order.findByIdAndUpdate(orderid,
        { status: "Return Requested" },
        { new: true }                       
      );
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      res.render("error", { error: error.message });
    }
  },

  approveReturn: async (req, res) => {
    try {
      let orderid = req.body.id;
     
      console.log(orderid);
      let order = await Order.findById(orderid);
      let user= order.userid
      const userwallet = await walletModel.findOne({ userid: user });
      if (userwallet) {
        await walletModel.findByIdAndUpdate(
          userwallet._id,
          {
            $inc: { balance: order.totalAmount },
            $push: {
              orderDetails: {
                orderid: orderid,
                amount: order.totalAmount,
                type: "Added",
              },
            },
          },
          { new: true }
        );
      } else {
        let wallet = new walletModel({
          userid: user,
          balance: order.totalAmount,
          orderDetails: [
            {
              orderid: orderid,
              amount: order.totalAmount,
              type: "Added",
            },
          ],
        });
        await wallet.save();
      }
      for (const product of order.products) {
        await Product.findByIdAndUpdate(
          product.productid,
          {
            $inc: { productquantity: product.quantity },
          },
          { new: true }
        );
      }
      order = await Order.findByIdAndUpdate(
        orderid,
        { paymentStatus: "Refund" },
        { new: true }
      );
      order = await Order.findByIdAndUpdate(
        orderid,
        { status: "Returned" },
        { new: true }
      );
      if (order) {
        res.send({ message: "1" });
      } else {
        res.send({ message: "0" });
      }
    } catch (error) {
      console.log(error.message);
      // res.render("error", { error: error.message });
    }
  },

}

module.exports = order;

let checkStock = async (user) => {
  // console.log("checking stock");
  let flag = 0;
  const Cart = await cart
    .findOne({ userid: user })
    .populate("products.productid");
  console.log(Cart);
  for (const products of Cart.products) {
    const pro = await Product.findOne({ _id: products.productid });
    // console.log("pro" +pro);
    if (products.Cartquantity > pro.quantity) {
      flag = 1;
      break;
    }
  }
  // console.log(flag);
  return flag;
};