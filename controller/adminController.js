const collection = require('../models/userData')
const product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Brand = require('../models/brandModel')
const Order = require('../models/orderModel')

const adminPage = {
    adminLogin: (req, res) => {
        res.render('adminlogin')
    },
    adminHome: async (req, res) => {
        try {
            const user = await collection.find({ admin: 0 })
            const admin = await collection.findOne({ admin: 1 })
            if (req.body.email == admin.email && req.body.password === admin.password) {
                req.session.admin_id=req.body.email
                res.render('adminhome')
            } else {
                res.render('adminlogin', { message: "Incorect Password" })
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    
    home:async (req,res)=>{
        try{
            res.render('adminhome')

        }catch (error){
       console.log(error.message);
       }
    },

    //listing of the products
    adminProduct: async (req, res) => {
        try {
            const categories = await Category.find({status:true})
            const brand= await Brand.find({})
            res.render('adminproduct', { category: categories ,brand:brand})
        } catch (error) {
            console.log(error.message);
        }
    },


    addingproduct: async (req, res) => {
        try {
            const arrImages = [];
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    arrImages.push(req.files[i].filename);
                }
            }

            const newproduct = new product({
                productname: req.body.productname,
                category: req.body.category,
                brand: req.body.brand,
                quantity: req.body.quantity,
                Gender:req.body.gender,
                price: req.body.price,
                description: req.body.description,
                productimage: arrImages
            });
            console.log(newproduct)

            await newproduct.save();
            console.log("hi");
            res.status(200).redirect('/admin/productlist');
        } catch (error) {
            console.log(error.message);
        }
    },

    //lists all the users
    userList: async (req, res) => {
        const user = await collection.find({admin:{$ne:1}})
        res.render('userlist', { users: user })
    },

    editProdut: async (req, res) => {
        try {
            const userid = req.query.id;
            console.log(userid);
            const productdata = await product.findById({_id:userid })
            console.log(productdata);
            res.render('editproduct', { productdata: productdata })
        } catch (error) {
            console.log(error.message);
        }
    },

    deleteProduct: async(req,res)=>{
        try{
            await product.findByIdAndDelete(req.query.id)
            res.redirect("/admin/productlist")
        }catch(error){
            console.log(error.message);
        }
    },

    updateProduct:async(req,res)=>{
        try{
            let dataobj;
            const arrImages=[]
            if(req.files.length > 0){
                console.log("if part");
                for(let i=0;i<req.files.length;i++){
                    
                    arrImages[i]=req.files[i].filename;
                    // console.log(i);
                }
                dataobj={
                    productname: req.body.productname,
                    category: req.body.category,
                    brand: req.body.brand,
                    quantity: req.body.quantity,
                    price: req.body.price,
                    description:req.body.description,
                    productimage:arrImages 
                };
            }else{
                console.log("else part");
                dataobj = {

                    productname: req.body.productname,
                    category: req.body.category,
                    brand: req.body.brand,
                    quantity: req.body.quantity,
                    price: req.body.price,
                    description: req.body.description,
                  };
            }   
            const product_data=await product.findByIdAndUpdate(
                {_id:req.body.id},
                {$set: dataobj},
                {new:true}
            );
            res.redirect("/admin/productlist")
        }catch(error){
            console.log(error.message);
            res.status(500).send({sucess:false, msg:error.message})
        }
    },

    category: async (req, res) => {
        const category = await Category.find({})
        res.render('adminCategory', { category: category })
    },

    Category:async(req,res)=>{
        res.render("addCategory")
    },

    Brand: async(req,res)=>{
            const brand = await Brand.find({})
            res.render('brandlist',{ brand: brand })
    },

    editcategory: async (req,res)=>{
        try{
            const userid=req.query.id;
            const categorydata = await Category.findById({_id:userid})
            res.render('editCategory',{ category: Category })
        }catch(error){
            console.log(error.message);
        }
    },
    
    deletecategory:async(req,res)=>{
        try{
            await Category.findByIdAndDelete(req.query.id)
            res.redirect("/admin/category")
        }catch(error){
            console.log(error.message);
        }
    },

    // listUnlistCategory:async (req, res) => {
    //     try {
    //       const id = req.query.id;
    //       const text = req.body.text;
    //       let value = text == "List" ? 1 : 0;
    //       const done = await categoryCollection.findByIdAndUpdate(
    //         { _id: id },
    //         { $set: { list: value } }
    //       );
    //       if (done) {
    //         res.send({ message: "1", status: done });
    //       } else {
    //         res.send({ message: "0" });
    //       }
    //     } catch (error) {
    //       console.log(error.message);
    //     }
    //   },

    changeCategoryStatus: async (req, res) => {
        try {
          console.log(req.body.value);
    
          const updated = await Category.updateOne({ _id: req.body.id }, { $set: { status: req.body.value } })
          console.log(updated);
          res.status(201).json({ message: "Status updated" })
        } catch (error) {
          console.log(error.message);
        }
    },

    productList: async (req, res) => {
        try{
        const products = await product.find({})
        res.render('productlist', { product: products })
        }catch(error){
            console.log(error.message);
        }
    },

    addCategory: async (req, res) => {
        try {
            const categoryName = req.body.categoryName;
            console.log(categoryName);
            let categorylower=categoryName.toLowerCase().replace(/\s/g, "");
            console.log(categorylower);
            const existingCategory =await Category.findOne({categorylower:categorylower})
            if(existingCategory){
                req.flash("title","Category Already Exist");
                res.redirect("/admin/category")
            }else{
                const categoryData = new Category({
                    categoryName: req.body.categoryName,
                    categoryDescription: req.body.categoryDescription,
                    categorylower:categorylower
                });
            
            await categoryData.save();
            res.status(200).redirect('/admin/category')
        }

        } catch (error) {
            console.log(error.message);
        }
    },


    addbrand:async(req,res)=>{
       res.render('addBrand')
    },

    brandAdd: async (req, res) => {
        try {
            const brand = new Brand({
                brandName: req.body.brandName,
                brandDescription: req.body.brandDescription
            });
            await brand.save();
            // const categorydata = await Category.find({});
            res.status(200).redirect('/admin/brands')

        } catch (error) {
            console.log(error.message);
        }
    },

    deleteBrand:async(req,res)=>{
        try{
            await Brand.findByIdAndDelete(req.query.id)
            res.redirect("/admin/brands")
        } catch(error){
            console.log(error.message);
        }
    },

    //block and unblock user
    block_user: async(req,res)=>{
        try{
            const id =req.query.id;
            const user = await collection.findByIdAndUpdate(
                {_id:id},
                {$set:{block:true}}
            );
            if(user){
                res.send({message:"Blocked sucessfully"})
            }
        }catch(error){
            console.log(error.message);
        }
    },
    unblock_user:async(req,res)=>{
        try{
            const id=req.query.id;
            const user =await collection.findByIdAndUpdate(
                {_id:id},
                {$set:{block:false}}
            );
            if(user){
                res.send({message:"User Unblocked"})
            }
        }catch(error){
            console.log(error.message);
        }
    },
    logOut:async(req,res)=>{
        try{
            req.session.destroy();
            res.redirect('/admin')
        }catch(error){
            console.log(error.message);
        }
    },
    ordersPage:async(req,res)=>{
        try{
          const orders = await Order.find({}).populate("userid")
          res.render('orders',{orders:orders})
        }catch(error){
          console.log(error.message);
        }
      },
  
      orderDetails:async(req,res)=>{
          try{
              const data =req.query.id
              console.log(data);
              const order = await Order.findById({_id:req.query.id})
              .populate("userid")
              .populate("products.productid")
              .populate("address").exec();
              res.render('orderDetails',{orderDetail:order})
  
          }catch(error){
              console.log(error.message);
          }
      },

      statusUpdated:async(req,res)=>{
        try {
            const orderid = req.body.orderid;
            const status = req.body.status;
            console.log(orderid);
            const order_update = await Order.findByIdAndUpdate(
              { _id: orderid },
              { $set: { status: status } }
            );
            if (order_update) {
              res.send({ message: "1" });
            } else {
              res.send({ message: "0" });
            }
          } catch (error) {
            console.log(error.message);      
        }
      
      }

}

module.exports = adminPage