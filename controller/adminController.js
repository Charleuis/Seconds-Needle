const collection = require('../models/userData')
const product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Brand = require('../models/brandModel')
const Order = require('../models/orderModel')
const couponModel=require('../models/couponModel')
const Banner = require('../models/banner')
const moment = require("moment");
const multer= require("multer")
const path=require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/bannerimages");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({storage});




const adminPage = {
    adminLogin: (req, res) => {
        res.render('adminlogin')
    },
    adminHome: async (req, res) => {
        try {
            const user = await collection.find({ admin: 0 })
            const admin = await collection.findOne({ admin: 1 })
            const details= await Order.aggregate([
                {$match: {status: "Delivered"}},{$group: {_id: null,totalSales: { $sum: "$totalAmount" }}}])
              
            const TotalSales = details[0].totalSales;
            const ordercount = await Order.find({}).count()
            const productcount = await product.find({}).count()
            const categorycount = await Category.find({}).count()
            if (req.body.email == admin.email && req.body.password === admin.password) {
                req.session.admin_id=req.body.email
                res.render('adminhome',{revenue:TotalSales,order:ordercount,product:productcount,category:categorycount})
            } else {
                res.render('adminlogin', { message: "Incorect Password" })
            }
        } catch (error) {
                        res.render("error",{error:error.message});
 
        }
    },
    
    home:async (req,res)=>{
        try{
            const details= await Order.aggregate([
                {$match: {status: "Delivered"}},{$group: {_id: null,totalSales: { $sum: "$totalAmount" }}}])
              
            const TotalSales = details[0].totalSales;
            const ordercount = await Order.find({}).count()
            const productcount = await product.find({}).count()
            const categorycount = await Category.find({}).count()

            res.render('adminhome',{revenue:TotalSales,order:ordercount,product:productcount,category:categorycount})

        }catch (error){
            console.log(error.message);
                   res.render("error",{error:error.message});

       }
    },

    //listing of the products
    adminProduct: async (req, res) => {
        try {
            const categories = await Category.find({status:true})
            const brand= await Brand.find({})
            res.render('adminproduct', { category: categories ,brand:brand})
        } catch (error) {
            res.render("error",{error:error.message});

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
            await newproduct.save();
            res.status(200).redirect('/admin/productlist');
        } catch (error) {
            res.render("error",{error:error.message});

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
            const categorylist= await Category.find({list:{$ne:1}})
            const brandlist = await Brand.find({list:{$ne:1}})
            res.render('editproduct', { 
                productdata: productdata,
                category:categorylist,
                activeValue:productdata.category,
                brand:brandlist,
                activeBrand:productdata.brand,
                })
        } catch (error) {
                res.render("error",{error:error.message});

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
                    category: req.body.categoryname,
                    brand: req.body.brand,
                    quantity: req.body.quantity,
                    Gender:req.body.gender,
                    price: req.body.price,
                    description:req.body.description,
                    productimage:arrImages 
                };
            }else{
                dataobj = {
                    productname: req.body.productname,
                    category: req.body.categoryname,
                    brand: req.body.brand,
                    quantity: req.body.quantity,
                    Gender:req.body.gender,
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
                        res.render("error",{error:error.message});

            res.status(500).send({sucess:false, msg:error.message})
        }
    },

    deleteProduct: async(req,res)=>{
        try{
            console.log("for deleteion comes here");
            const couponid =req.query.id;
            console.log(couponid);
            await product.findByIdAndUpdate(
                {_id:couponid},
                { $set: { isActive:"No" } }
        );
            res.send({message:"1"})
           
        }catch(error){
            res.render("error",{error:error.message});

        }
    },

    deleteimage:async(req,res)=>{
        try{
            const id=req.body.proID 
            const prodetails= await product.findOne({productimage:id})
            await product.updateOne(
                { productname: prodetails.productname},
                {$pull: {   productimage: id } }
                ) 
                res.status(200).json({message:"1"})
        }catch(error){ 
            res.status(404).render('error',{error:error.message})        } 
    //    res.redirect('/admin/updateproduct')
    },

    category: async (req, res) => {
        const category = await Category.find({list:0})
        res.render('adminCategory', { category: category })
    },

    Category:async(req,res)=>{
        res.render("addCategory")
    },

    Brand: async(req,res)=>{
            const brand = await Brand.find({list:"0"})
            res.render('brandlist',{ brand: brand })
    },

    editcategory: async (req,res)=>{
        try{
            const userid=req.query.id;
            const categorydata = await Category.findById({_id:userid})
            res.render('editCategory',{ category: Category })
        }catch(error){
                        res.render("error",{error:error.message});

        }
    },
    
    deletecategory:async(req,res)=>{
        try{
            const categoryId =req.query.id;
            console.log(categoryId);
            await Category.findByIdAndUpdate(
                {_id:categoryId},
                { $set: { list:"1" } }
        );
            res.send({message:"1"})
           
        }catch(error){
                        res.render("error",{error:error.message});

        }
    },

    changeCategoryStatus: async (req, res) => {
        try {
          console.log(req.body.value);
    
          const updated = await Category.updateOne({ _id: req.body.id }, { $set: { status: req.body.value } })
          console.log(updated);
          res.status(201).json({ message: "Status updated" })
        } catch (error) {
                      res.render("error",{error:error.message});

        }
    },

    productList: async (req, res) => {
        try{
            const products = await product.find({ isActive: "Yes" });
            res.render('productlist', { product: products })
        }catch(error){
            res.render("error",{error:error.message});

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
            res.render("error",{error:error.message});

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
            res.render("error",{error:error.message});

        }
    },

    deleteBrand:async(req,res)=>{
        try{
            await Brand.findByIdAndUpdate(
                {_id:req.query.id},
                {$set:{list:"1"}
            })
            res.send({message:"1"})
        } catch(error){
            res.render("error",{error:error.message});

        }
    },

    editbrand: async(req,res)=>{
        try {
            const userid=req.query.id;
            const branddata = await Brand.findById({_id:userid})
            res.render('editBrand',{ brand: branddata })
        } catch (error) {
            res.render("error",{error:error.message});

        }
    },

    updateBrand: async(req,res)=>{
        try {
            branddata = {
                brandName: req.body.brandName,
                brandDescription: req.body.brandDescription
              };
        await Brand.findByIdAndUpdate(
            {_id:req.body.id},
            {$set: branddata},
            {new:true}
        );

        res.redirect("/admin/brands")

        } catch (error) {
            res.render("error",{error:error.message});
        }
    },

    changeBrandStatus:async(req,res)=>{
        try {
            const updated = await Brand.updateOne({ _id: req.body.id }, { $set: { status: req.body.value } })
            console.log(updated);
            res.status(201).json({ message: "Status updated" })
        } catch (error) {
                res.render("error",{error:error.message});
        }
    },

    //banner adding

    bannerPage: async(req,res)=>{
        try {
            const banner = await Banner.find({});
            const category = await Category.find({})
            res.render('banner',{banner,category})
        } catch (error) {
            res.render("error",{error:error.message});
        }
    },

    add_banner :async(req,res)=>{
        try {
            upload.single("bannerimage")(req, res, async (err) => {
                if (err) {
                  console.log(err);
                  req.session.message = {
                    type: "error",
                    message: "Failed to upload profile photo",
                  };
                  res.send("error")
                  // return res.status(500).json({ error: 'Failed to upload profile photo' });
                }
          
                const filename = req.file.filename;
                const offerPage = req.body.category
                
                    const {Description} = req.body
                            
                        const name = req.body.name
                        const newBanner = new Banner({
                        title: name,
                        image :filename ,
                        link : offerPage,
                        description: Description,
                           })
                        const banner = await newBanner.save()
                        if(banner){
                        res.send({message:"banner added"})
                        }else{
                        res.send({message:"something went worng"})
                        }
            });
        } catch (error) {
            res.render('error',{error:error.message})
        }
    },

    delete_banner:async(req,res)=>{
        try {
        if(req.query.id){
            await Banner.findByIdAndDelete({_id: req.query.id})
            res.send({message: "1"})
            } else{
            res.send({message: "0"})
            }
        } catch (error) {
            res.render('error',{error:error.message})
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
                        res.render("error",{error:error.message});

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
                        res.render("error",{error:error.message});

        }
    },

    logOut:async(req,res)=>{
        try{
            req.session.destroy();
            res.redirect('/admin')
        }catch(error){
            res.render("error",{error:error.message});
        }
    },

    ordersPage:async(req,res)=>{
        try{
          const orders = await Order.find({}).populate("userid")
          res.render('orders',{orders:orders})
        }catch(error){
            res.render("error",{error:error.message});
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
                res.render("error",{error:error.message});

          }
      },

      statusUpdated:async(req,res)=>{
        try {
            const orderid = req.body.orderid;
            const status = req.body.status;
            console.log(orderid);
            if(status){
            if(status=="Delivered"){

                const order_update = await Order.findByIdAndUpdate(
                    { _id: orderid },
                    { $set: { status: status ,paymentStatus:"Paid"} }
                  );
            }else{
                const order_update =  await Order.findByIdAndUpdate(
                    { _id: orderid },
                    { $set: { status: status } }
                  );
            }
            if (status == "Delivered") {
                const deliveredDate = new Date();
                // const completionTime = moment(deliveredDate).add(1, "minute");
                const completionTime = moment(deliveredDate).add(1, "days");
                setTimeout(async () => {
                  const updatedOrder = await Order.findById(orderid);
                  if (
                    updatedOrder &&
                    updatedOrder.status !== "Completed" &&
                    updatedOrder.status !== "Return Requested" &&
                    updatedOrder.status !== "Returned"
                  ) {
                    updatedOrder.status = "Completed";
                    await updatedOrder.save();
                  }
                }, completionTime.diff(moment()));
              }
        
          
              res.send({ message: "1" });
            } else {
              res.send({ message: "0" });
            }
          } catch (error) {
                res.render("error",{error:error.message});
      
        }
      
      },

      coupon:async(req,res)=>{
        try{
            let coupon =await couponModel.find({});
            res.render('couponsList',{coupons:coupon})
        }catch(error){
           console.log(error.message);
        }
      },

      addCouponPage:async(req,res)=>{
        try{
            res.render('addCoupon')
        }catch(error){
            console.log(error.message);
        }
      },
      
      addCoupon:async(req,res)=>{
        try{
            const coupon = new couponModel({
                couponCode: req.body.code,
                couponAmount: req.body.discountprice,
                expireDate: req.body.expiry,
                couponDescription: req.body.coupondescription,
                minimumAmount: req.body.min_purchase,
              });
              coupon.save();
              res.redirect("/admin/coupon");


        }catch(error){
            console.log(error.message);
        }
      },

      editCoupanPage:async(req,res)=>{
        try{
            const coupon = await couponModel.findOne({_id:req.query.id})
            res.render("editCoupon",{coupon})
        }catch(error){
            console.log(error.message);
        }
      },

      updateCoupon:async(req,res)=>{
        try{
            let coupon={
                couponCode:req.body.code,
                CouponAmount:req.body.discountprice,
                expireDate:req.body.expiry,
                couponDescription:req.body.coupondescription,
                minimumAmount: req.body.min_purchase,
            }
            await couponModel.findByIdAndUpdate(
                {_id:req.body.id},
                {$set:coupon},
                {new:true});

            res.redirect("/admin/coupon")

        }catch(error){
            console.log(error.message);
        }
      },

      deleteCoupon:async(req,res)=>{
        try{
            const couponid =req.query.id;
            console.log(couponid);
            await couponModel.findByIdAndDelete({_id:couponid})
            res.send({message:"1"})
        }catch(error){
            console.log(error.message);
        }
      },

      salesReport: async(req,res)=>{
        try {
            const order_details = await Order.find({})
            .populate("userid")
            .populate("products.productid")
            .exec();
            res.render("salesReport", { orders: order_details });
          } catch (error) {
            console.log(error.message)
          //   res.render('error', { error: error.message })
          }
      
      },

      fetchChartData:async(req,res)=>{
        try {
            const salesData = await Order.aggregate([
                { $match: { status: 'Delivered' } },  { $group: { _id: { $dateToString: { format: '%Y-%m-%d',date: { $toDate: '$orderDate' } }},totalRevenue: { $sum: '$totalAmount' } }},
                {$sort: { _id: -1 }},{$project: { _id: 0, date: '$_id',totalRevenue: 1}},{$limit: 7}]);
        
                // const productData = await orderdb.aggregate([
                // { $match: { status: 'Delivered' } },  { $group: { _id: { $dateToString: { format: '%Y-%m-%d',date: { $toDate: '$purchased' } }},totalRevenue: { $sum: '$grandtotal' } }},
                // {$sort: { _id: -1 }},{$project: { _id: 0, date: '$_id',totalRevenue: 1}},{$limit: 4}]);
        
            //   console.log(salesData);
        
              const data = [];
              const date = [];
            for (const totalRevenue of salesData) {
                data.push(totalRevenue.totalRevenue);
              }
            
                for (const item of salesData) {
                date.push(item.date);
              }
              data.reverse()
              date.reverse();
              
    
            res.status(200).send({ data:data, date:date })
      
        } catch (error) {
            res.status(404).render('error',{error:error.message}) 
        }
    
    },

    chartData2: async (req, res) => {
        try {
          const salesData = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m', date: { $toDate: '$orderDate' } }
                },
                totalRevenue: { $sum: '$totalAmount' }
              }
            },
            { $sort: { _id: -1 } },
            { $project: { _id: 0, date: '$_id', totalRevenue: 1 } },
            { $limit: 7 }
          ]);
      
          const data = [];
          const date = [];
      
    
          for (const totalRevenue of salesData) {
            data.push(totalRevenue.totalRevenue);
            const monthName = new Date(totalRevenue.date + '-01').toLocaleString('en-US', { month: 'long' });
            date.push(monthName);
          }
          data.reverse();
          date.reverse();
          res.status(200).json({ data: data, date: date });
      
        } catch (error) {
            res.status(404).render('error',{error:error.message}) 
        }
            },


}

module.exports = adminPage