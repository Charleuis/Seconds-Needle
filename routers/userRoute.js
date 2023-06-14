const express = require('express')
const user_route =express();
const path=require('path')
const flash=require('connect-flash')
const session=require('express-session')
const Authentication=require('../middleware/userAuthentication')
const userController=require('../controller/userController');
const cartController = require('../controller/cartController');
const orderController = require('../controller/orderController')

user_route.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

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

user_route.get('/',Authentication.isLogin,userController.userPage)
user_route.get('/signin',userController.loginpage)
user_route.get('/signup',userController.signuppage)
user_route.get('/verify',userController.verifypage)
user_route.post('/signup',userController.signup)
user_route.post('/sendEmail',userController.signupEmail)
user_route.post('/signUpOtpVerify',userController.signUpOtpVerify)
user_route.post('/signin',userController.verifyuser)
user_route.get('/logout',userController.logout)
user_route.get('/forgetPass',userController.forgetpass)
user_route.post('/confsend',userController.forgEmailSent)
// user_route.get('/homepage',userController.userPageLoad)
user_route.get('/cart',Authentication.cartLogin,Authentication.isBlocked,cartController.cart)
user_route.get('/userdash',Authentication.isLogin,Authentication.isBlocked,userController.userDash)
user_route.get('/addAddress',Authentication.isLogin,Authentication.isBlocked,userController.addAddress)
user_route.post('/checkoutaddaddress',Authentication.isLogin,Authentication.isBlocked,userController.newAddress)
user_route.get('/editAddress',Authentication.isLogin,Authentication.isBlocked,userController.editAddress)
user_route.post('/updateAddress',Authentication.isLogin,Authentication.isBlocked,userController.updateAddress)
user_route.get('/orderstatus',Authentication.isLogin,Authentication.isBlocked,userController.orderStatus)
user_route.get('/deleteAddress',Authentication.isLogin,Authentication.isBlocked,userController.deleteAddress)

user_route.post('/placeOrder',Authentication.isLogin,Authentication.isBlocked,orderController.placeOrder)

user_route.post('/search',Authentication.isLogin,userController.searchData)


//otp verify
user_route.get('/otplog',userController.otplogpage)
user_route.post('/send',userController.otp_signin)
user_route.post('/verify',userController.otpVerify)
user_route.get('/phoneOtp',userController.mobileOtp)        //otp mobile showing
user_route.post('/mobSend',userController.configmobotp)

user_route.get('/product',userController.product)
user_route.get('/singleProduct',userController.selectedProduct)
user_route.get('/cartadd',Authentication.isLogin,Authentication.isBlocked,cartController.cartAdd)
user_route.get('/deleteCartItem',cartController.deleteItem)
user_route.post('/incrementproduct',cartController.increment_product)
user_route.post('/decrement',cartController.decrement_product)
user_route.get('/checkout',Authentication.isLogin,Authentication.isBlocked,cartController.checkOut)




//exporting file to any place 
module.exports=user_route