const express= require('express')
const admin_route=express()
const adminController=require('../controller/adminController')
const orderController =require('../controller/orderController')
const session=require('express-session')
const multer=require('multer')
const path=require('path')
const auth = require('../middleware/adminAuthentication')


admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

admin_route.use(express.static('./public'))

// files we are getting in binary data which are then converting into json file
admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:false}))

//image uploading
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/upload'),function(err,success){
            if(err){
                throw err
            }
        })
    },
    filename: function(req,file,cb){
        const name =Date.now()+'-'+file.originalname;
            cb(null,name,function(err,success){
                if(err){
                    throw err
                }
            })
        }
    })
    const upload = multer({storage:storage});

//dashboard controller
admin_route.get('/',adminController.adminLogin)
admin_route.get('/home',adminController.home)
admin_route.post('/home',adminController.adminHome)
admin_route.get('/users',adminController.userList)
admin_route.get('/category',adminController.category)
admin_route.get("/brands",adminController.Brand)
admin_route.get('/productlist',adminController.productList)
admin_route.get('/logout',adminController.logOut)
admin_route.get('/banner',adminController.bannerPage)

//block and unblock
admin_route.post("/block-user",adminController.block_user)
admin_route.post("/unblock-user",adminController.unblock_user)

//product section
admin_route.get('/product',adminController.adminProduct)
admin_route.post('/addproduct',upload.array('productimage'),adminController.addingproduct)
admin_route.get('/editproduct',adminController.editProdut)
admin_route.get('/deleteproduct',adminController.deleteProduct)
admin_route.post('/updateproduct',upload.array('productimage'),adminController.updateProduct)

admin_route.post('/addcategory',adminController.addCategory)
admin_route.get('/btncategory',adminController.Category)
admin_route.patch("/categoryStatus",adminController.changeCategoryStatus)
admin_route.get('/editcategory',adminController.editcategory)
admin_route.get('/deletecategory',adminController.deletecategory)

admin_route.post("/addbrand",adminController.brandAdd)
admin_route.get("/deletebrand",adminController.deleteBrand)
admin_route.get('/editbrand',adminController.editbrand)
admin_route.post('/updatebrand',adminController.updateBrand)
admin_route.get("/btnbrand",adminController.addbrand)
admin_route.patch('/brandStatus',adminController.changeBrandStatus)

//orders section
admin_route.get('/Orders',adminController.ordersPage)
admin_route.get('/orderdetails',adminController.orderDetails)
admin_route.post('/returnapprove',orderController.approveReturn)
admin_route.post('/statusupdate',adminController.statusUpdated)

admin_route.get('/coupon',adminController.coupon)
admin_route.get('/addCoupon',adminController.addCouponPage)
admin_route.post('/addCoupon',adminController.addCoupon)
admin_route.get('/editcouponpage',adminController.editCoupanPage)
admin_route.post('/updateCoupon',adminController.updateCoupon)
admin_route.get('/deleteCoupon',adminController.deleteCoupon)

admin_route.get('/salesReport',adminController.salesReport)

//banner management
admin_route.post('/addbanner',adminController.add_banner);
admin_route.get('/deletebanner',adminController.delete_banner)

admin_route.get('/chartData',adminController.fetchChartData)
admin_route.get('/chartData2',adminController.chartData2)

//exporting file to any place 
module.exports = admin_route