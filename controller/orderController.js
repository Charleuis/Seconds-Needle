const cart=require('../models/cartModel')
const Product = require('../models/productModel')
const Order=require('../models/orderModel')

const order ={
    placeOrder: async(req,res)=>{
        try{
            let flag = 0,
            stockOut=[];
            const address=req.body.address;
            const total=req.body.total;
            const payment=req.body.paymentmethod
            const user=req.session.user_id
          
            // console.log(user);
            // console.log(address);
            // console.log(total); 
            // console.log(payment);

            const Cart =await cart
            .findOne({userid:user})
            .populate("products.productid");

            console.log(Cart);

            Cart.products.forEach(async(product) =>{

                const pro = await Product.findOne({ _id: product.productid });
                console.log("pro q " + pro._id);

                if (product.Cartquantity > pro.quantity) {
                  flag = 1;
                  stockOut.push({ name: pro.name, available: pro.quantity });
                }
              });

              if (flag == 0) {
                const orderdetail = new Order({
                  userid: user,
                  totalAmount: total,
                  paymnetMethod: payment,
                  address: address,
                });

                Cart.products.forEach(async (product) => {
                  // let price =product.price;
                  let qty = product.Cartquantity;
                  let idpro = product.productid;

             
                  console.log("qty"+qty);
                  console.log("id"  +idpro);

                  orderdetail.products.push({
                    productid: idpro,
                    quantity: qty,
                  });

                  await Product.updateOne(
                    { _id: idpro },
                    { $inc: { quantity: -qty } }
                  );
                });

                await orderdetail.save();

                await cart.findOneAndDelete({ userid: user });
                console.log("updated");
                // res.render('home')
                res.send({ message: "1" });
              } else {
                res.send({ message: "0" });

              }
        }catch(error){
            console.log(error.message);
        }
    },
    
}

module.exports = order;