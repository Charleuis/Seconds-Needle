const express = require('express')
const user_route =express();
const path=require('path')
const flash=require('connect-flash')
const session=require('express-session')
const {v4:uuidv4}=require('uuid')
const nocache=require('nocache')
const adminRouter= require('../routers/adminRoute')
const Authentication=require('../middleware/userAuthentication')
const userController=require('../controller/userController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController')

user_route.use(session({
  secret:uuidv4(),
  resave:false,
  saveUninitialized:true
}));

user_route.use(nocache())


//static files like photos storing
user_route.use(express.static('./public'))

//for the pop up messages
user_route.use(flash())

// files we are getting in binary data which are then converting into json file
user_route.use(express.json())
user_route.use(express.urlencoded({extended:false}))

//ejs file setting
user_route.set('view engine','ejs')
user_route.set('views','./views/user')

//user settings
user_route.get('/',Authentication.isLogin,userController.userPage)
user_route.get('/signin',userController.loginpage)
user_route.get('/signup',userController.signuppage)
user_route.get('/verify',userController.verifypage)
user_route.post('/signup',userController.signup)
user_route.post('/sendEmail',userController.signupEmail)
user_route.post('/signin',userController.verifyuser)
user_route.get('/logout',userController.logout)

// dashboard settings
user_route.get('/userdash',Authentication.isLogin,Authentication.isBlocked,userController.userDash) // inside itself wallet
user_route.get('/orderstatus',Authentication.isLogin,Authentication.isBlocked,userController.orderStatus)
user_route.get('/orderDetail',Authentication.isLogin,Authentication.isBlocked,userController.productOrderDetail)

//address settings
user_route.get('/addAddress',Authentication.isLogin,Authentication.isBlocked,userController.addAddress)
user_route.post('/checkoutaddaddress',Authentication.isLogin,Authentication.isBlocked,userController.newAddress)
user_route.get('/deleteAddress',Authentication.isLogin,Authentication.isBlocked,userController.deleteAddress)
user_route.get('/editAddress',Authentication.isLogin,Authentication.isBlocked,userController.editAddress)
user_route.post('/updateAddress',Authentication.isLogin,Authentication.isBlocked,userController.updateAddress)

//after placing order
user_route.post('/placeOrder',Authentication.isLogin,Authentication.isBlocked,orderController.placeOrder)
user_route.post('/razorpay',Authentication.isLogin,Authentication.isBlocked,orderController.createOrder)
user_route.get('/sucess',Authentication.isLogin,Authentication.isBlocked,orderController.sucessPage)
user_route.post('/cancel',Authentication.isLogin,Authentication.isBlocked,userController.orderCancel)
user_route.post('/returnorder',Authentication.isLogin,Authentication.isBlocked,orderController.returnrequest)

//search
user_route.post('/search',userController.searchData)

//otp verify
user_route.get('/otplog',userController.otplogpage)
user_route.post('/send',userController.otp_signin)
user_route.get('/otpresend',userController.otpresend)
user_route.post('/verify',userController.otpVerify)
user_route.get('/phoneOtp',userController.mobileOtp)        
user_route.post('/mobSend',userController.configmobotp)
user_route.post('/signUpOtpVerify',userController.signUpOtpVerify)

//forget password
user_route.get('/forgetPass',userController.forgetpass)
user_route.post('/confsend',userController.forgPassSent)
user_route.post('/resetPassword',userController.resetPassword)
user_route.post('/changePassword',userController.changePassword)

//product details
user_route.get('/product',userController.product)
user_route.get('/singleProduct',userController.selectedProduct)

//cart items
user_route.get('/cart',Authentication.signinLogin,Authentication.isBlocked,cartController.cart)
user_route.get('/cartadd',Authentication.signinLogin,Authentication.isBlocked,cartController.cartAdd)
user_route.get('/quickbuy',Authentication.signinLogin,Authentication.isBlocked,cartController.cartAdd)
user_route.get('/deleteCartItem',cartController.deleteItem)
user_route.post('/incrementproduct',cartController.increment_product)
user_route.post('/decrement',cartController.decrement_product)

//checkout page
user_route.get('/checkout',Authentication.isLogin,Authentication.isBlocked,cartController.checkOut)

//coupon checking
user_route.post('/checkvalidcoupon',Authentication.isLogin,Authentication.isBlocked,cartController.validCoupon)

//category
user_route.get('/ladiesWear',userController.ladiesWearPage)
user_route.get('/kidsWear',userController.kidsWearPage)
user_route.get('/mensWear',userController.menWearPage)
user_route.get('/smartWatches',userController.smartWearPage)

//banner
user_route.get('/bannerlink',userController.bannerlink)

user_route.use('/admin', adminRouter);
user_route.use((req, res, next) => {
    const error = new Error('Page not found');
    error.status = 404;
    next(error);
  });
  
  // Error handling middleware to display the error message
  user_route.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.status(status).render('error', { error: message });
  });

//exporting file to any place 
module.exports=user_route