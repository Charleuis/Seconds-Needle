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
admin_route.get('/',auth.isLogout,adminController.adminLogin)
admin_route.get('/home',auth.isLogin,adminController.home)
admin_route.post('/home',auth.isLogout,adminController.adminHome)
admin_route.get('/users',auth.isLogin,adminController.userList)
admin_route.get('/category',auth.isLogin,adminController.category)
admin_route.get("/brands",auth.isLogin,adminController.Brand)
admin_route.get('/productlist',adminController.productList)
admin_route.get('/logout',auth.isLogin,adminController.logOut)
admin_route.get('/banner',adminController.bannerPage)

//block and unblock
admin_route.post("/block-user",auth.isLogin,adminController.block_user)
admin_route.post("/unblock-user",auth.isLogin,adminController.unblock_user)

//product section
admin_route.get('/product',adminController.adminProduct)
admin_route.post('/addproduct',upload.array('productimage'),adminController.addingproduct)
admin_route.get('/editproduct',adminController.editProdut)
admin_route.get('/deleteproduct',adminController.deleteProduct)
admin_route.post('/deleteimage',adminController.deleteimage)
admin_route.post('/updateproduct',upload.array('productimage'),adminController.updateProduct)

//category section
admin_route.post('/addcategory',auth.isLogin,adminController.addCategory)
admin_route.get('/btncategory',auth.isLogin,adminController.Category)
admin_route.patch('/categoryStatus',auth.isLogin,adminController.changeCategoryStatus)
admin_route.get('/editcategory',auth.isLogin,adminController.editcategory)
admin_route.get('/deletecategory',auth.isLogin,adminController.deletecategory)

//brand section
admin_route.post("/addbrand",auth.isLogin,adminController.brandAdd)
admin_route.get("/deletebrand",auth.isLogin,adminController.deleteBrand)
admin_route.get('/editbrand',auth.isLogin,adminController.editbrand)
admin_route.post('/updatebrand',auth.isLogin,adminController.updateBrand)
admin_route.get("/btnbrand",auth.isLogin,adminController.addbrand)
admin_route.patch('/brandStatus',auth.isLogin,adminController.changeBrandStatus)

//orders section
admin_route.get('/Orders',auth.isLogin,adminController.ordersPage)
admin_route.get('/orderdetails',auth.isLogin,adminController.orderDetails)
admin_route.post('/returnapprove',auth.isLogin,orderController.approveReturn)
admin_route.post('/statusupdate',auth.isLogin,adminController.statusUpdated)

//coupon section
admin_route.get('/coupon',auth.isLogin,adminController.coupon)
admin_route.get('/addCoupon',auth.isLogin,adminController.addCouponPage)
admin_route.post('/addCoupon',auth.isLogin,adminController.addCoupon)
admin_route.get('/editcouponpage',auth.isLogin,adminController.editCoupanPage)
admin_route.post('/updateCoupon',auth.isLogin,adminController.updateCoupon)
admin_route.get('/deleteCoupon',auth.isLogin,adminController.deleteCoupon)

//sales report
admin_route.get('/salesReport',adminController.salesReport)

//banner management
admin_route.post('/addbanner',adminController.add_banner);
admin_route.get('/deletebanner',adminController.delete_banner)

//chart data in dashboard
admin_route.get('/chartData',auth.isLogin,adminController.fetchChartData)
admin_route.get('/chartData2',auth.isLogin,adminController.chartData2)

//exporting file to any place 
module.exports = admin_route