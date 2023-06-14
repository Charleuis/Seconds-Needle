const mongoose =require('mongoose')
const collection = require('../models/userData')
const Product = require('../models/productModel')
const cart=require('../models/cartModel')
const address=require('../models/Address')
const useraddress = require('../models/Address')

const cartController={
    cart: async (req,res)=>{
        try{
        const user = req.session.user_id
        const userdetails = await collection.findOne({_id:user})
        const cartdetails= await cart.findOne({userid:user}).populate("products.productid").populate("userid").exec()
            // const user=await collection.findOne({email: userid.name})
            // console.log(user);
            // const cartData= await cart.findOne({userid: }).populate("products.productid")
            res.render('cart',{cart:cartdetails, userdata: userdetails, title:user})
        }catch(error){
            console.log(error.message);
        }
    },

    cartAdd : async (req, res) => {
        try {
            let flag = 0;
            const proId = req.query.id;
            const userid = req.session.user_id;
            const product = await Product.findById(proId);
            let proqty = product.quantity;
            // console.log(proId);
            console.log(userid);
            

            if (proqty > 0) {
                const Cart = await cart.findOne({ userid : userid});
                // console.log(Cart);

                if (Cart) {
                    const proExist = Cart.products.findIndex((product) =>
                        product.productid.equals(proId)
                    );

                    if (proExist !== -1) {
                            flag = 1;
                            req.flash("title", "Already Added");
                            res.redirect(req.get("referer"));
                        
                    } else {
                        await cart.findOneAndUpdate(
                            { userid:userid },
                            { $push: { products: { productid: proId, quantity: 1 } } },
                            { new: true }
                        );
                    }
                } else {
                    console.log('else');
                    const newCart = new cart({
                        userid: userid,
                        products: [{ productid: proId, quantity: 1 }],
                    });
                    await newCart.save();
                }

                if (flag === 0) {
                    res.redirect("back");
                } 
            }else {
                req.flash("title", "Quantity Exceeds");
                res.redirect(req.get("referer"));
            }
        } catch (error) {
            console.log(error.message);
        };
    },

    deleteItem: async(req,res)=>{
        try{
        const proid=req.query.id
        const userdata=req.session.user_id
        console.log(proid);
        console.log(userdata);
        await cart.updateOne(
            { userid: userdata },
            { $pull: { products: { _id: proid } } }
          );
          
        res.redirect('/cart')


        }catch(error){
            console.log(error.message);
        }
    },
    increment_product:async(req,res)=>{
        try{
            const proid=req.body.proID
            console.log(proid);
            const Quantity = req.body.quantity
            console.log(Quantity);
            const q1=parseInt(Quantity)+1
            const checkQuatity= await Product.findById({_id:proid});
            console.log(checkQuatity.quantity);
            const userid=req.session.user_id
            console.log(userid);
            if(checkQuatity.quantity>= q1){
                const productupdate= await cart.updateOne(
                    {userid:userid, "products.productid": proid},
                    {$inc : { "products.$.Cartquantity" : 1 }}
                )
                res.send({message:"1"})
            }else{
                res.send({message:"0"})
            }
        }catch(error){
            console.log(error.message);
        }
    },

    decrement_product:async(req,res)=>{
        try{

            const proid=req.body.proID
            console.log(proid);
            const Quantity = req.body.quantity
            console.log(Quantity);
            const q1=parseInt(Quantity)-1
            const userid=req.session.userid
            console.log(userid);

            if(q1>0){
                const productupdate= await cart.updateOne(
                    {userID:userid, "products.productid": proid},
                    {$inc : { "products.$.Cartquantity" : -1 }}
                )
                res.send({message:"1"})
            }else{
                res.send({message:"0"})
            }

        }catch(error){
            console.log(error.message);
        }
    },

    checkOut: async(req,res)=>{
        try{
            const userid = req.session.user_id
            const userAddress=await useraddress.find({userid:req.session.user_id}).populate("userid")
            const userdetails= await cart.findOne({userid:userid}).populate("products.productid").populate("userid").exec()
            res.render('checkout',{useraddress:userAddress,cart:userdetails})
        }
        catch(error){
            console.log(error.message);
        }
    },

}

module.exports = cartController;
