const mongoose = require('mongoose')
const collection = require('../models/userData')
const nodemailer = require('nodemailer')
const otpgenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const otp = require('../models/otpmodels')
const Product = require('../models/productModel')
const { response } = require('../routers/userRoute')
const session = require('express-session')
const useraddress = require('../models/Address')
const order =require('../models/orderModel')

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
let twilioNum=process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid,authToken);



const userPage = {
    userPage: (req, res) => {
        res.render('home', { title: req.session.user_id})
    },
    loginpage: (req, res) => {
        res.render('signin')
    },
    signuppage: (req, res) => {
        res.render('signupEmail')
    },
    otplogpage: (req, res) => {
        const title = req.flash('notice')
        res.render('otpLogin', { notice: title[0] || "" })
    },
    verifypage: (req, res) => {
        res.render('otp')
    },

    //------- body name,email,phone and password were saved into database and if the data already their show popup message already registered

    signup: async (req, res) => {
        try {
            const checking = await collection.findOne({ email: req.body.signin_email });
            console.log(checking);
            
                //   const password = req.body.signin_password1;
                //   const salt = await bcrypt.genSalt(10);
                //   const hashedPassword = await bcrypt.hash(password, salt);

                const data = new collection({
                    name: req.body.signin_name,
                    email: req.body.signin_email,
                    phone:"+91 "+ req.body.signin_number,
                    password: req.body.signin_password1,
                    admin: 0
                });

                await data.save();
                // req.session.user = req.body.data;
                res.redirect('/signin');
            
        } catch (error) {
            console.log(error.message);
        }

    },

    signupEmail: async(req,res)=>{
        try {
            const checking = await collection.findOne({ email: req.body.email });
            console.log(checking);
            if (checking) {
                res.render('signupEmail', { notice: "Already have an Account" });
            } else {
                const OTP = otpgenerator.generate(4, {
                    digits: true,
                    alphabets: false,
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false,
                });
                console.log(OTP);
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "Secounds Needle<charleslouis1234@gmail.com>",
                        pass: "tuytzbmtgdewseqp",
                    },
                });
                var mailOptions = {
                    from: "charleslouis1234@gmail.com",
                    to: req.body.email,
                    subject: "Sample OTP Verification",
                    text:
                        "Hi" +
                        ",\n Welcome to Seconds Needle the first online watch shop.\n Enter the OTP to sign Up " + OTP,
                };
                transporter.sendMail(mailOptions, function (error, info) { });
                const Otp = new otp({ identifier: req.body.email, otp: OTP });
                const salt = await bcrypt.genSalt(10);
                Otp.otp = await bcrypt.hash(Otp.otp, salt);
                const result = await Otp.save();
                res.render('otpSignUp',{signin_email:req.body.email})
            }
        }catch(error){
            console.log(error.message);
        }
    },

    signUpOtpVerify:async(req,res)=>{
        try{
            const data = req.body.userDetails
            console.log(data);
            const userotp = req.body.otp;
            const otpholder = await otp.findOne({ identifier: data });
            if (otpholder) {
                const validuser = await bcrypt.compare(userotp, otpholder.otp)
                if (validuser) {
                    await otp.deleteOne({ identifier: data })
                    res.render('signup',{signin_email:data})
                } else {
                    req.flash("notice", "Your OTP is wrong")
                    res.render('otpSignUp',{ signin_email:data})
                }
            } else {
                req.flash("notice", "You Used an expired otp")
                res.render('otpSignUp')
            }
        }catch(error){
            console.log(error.message);
        }
    },


    //-------- verification of user to home page

    verifyuser: async (req, res) => {
        try {
            const userData = await collection.findOne({ email: req.body.login_email })
            if (userData) {
                if (userData.block === 0) {
                    if (userData.password === req.body.login_password) {
                        req.session.user_id=userData._id;
                        res.redirect('/')
                        console.log('Login sucessfully');
                    } else {
                        res.render('signin', { message: "Password Incorrect" })
                        console.log('wrong password');
                    }
                } else {
                    res.render('signin', { message: "Account Blocked" })
                    console.log("Account Blocked");
                }
            } else {
                
                res.render("signin", { message: "Username Incorrect" });
            }
        } catch (error) {
            res.send(error.message);
        }
    },

    userDash: async(req,res)=>{
        try{
           
            const Order= await order.find({userid:req.session.user_id}).populate("address").populate("products.productid").exec();
            const userAddress=await useraddress.find({userid:req.session.user_id}).populate("userid")
            const userDetails= await collection.findById({_id:req.session.user_id})
            console.log(userDetails);
            res.render('userdashboard',{ userDetail:userDetails,title: req.session.user_id, useraddress:userAddress ,orderdetail:Order})

        }catch(error){
            console.log(error.message);
        }
    },

    //-------- if their is session checking and showing the logout and profile popdown screen by tittle

    // userPageLoad: async (req, res) => {
    //     const username = req.session.user_id
    //     res.render('home', { title: username })
    // },

    //-------- it is for the logout button inside the popdown screen in navbar through session is killed

    logout: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('/')
        } catch (error) {
            console.log(error.message);
        }
    },

    forgetpass:async(req,res)=>{
        try{
           res.render('forgetPassword')
        }catch(error){
            console.log(error.message);
        }
    },

    forgEmailSent: async(req,res)=>{
        try{

        }catch(error){
            console.log(error.message);
        }
    },

    //-------- otp fails popup

    otp_page: async (req, res) => {
        try {
            const title = req.flash("notice");
            console.log(notice);
            res.render("loginOtp", { notice: title[0] || "" });
        } catch (error) {
            console.log(error.message);
        }
    },

    //------- otp sending

    otp_signin: async (req, res) => {
        try {
            const userData = await collection.findOne({ email: req.body.email });
            console.log("otp started");
            if (userData) {

                if (userData.block === 0) {
                    const OTP = otpgenerator.generate(4, {
                        digits: true,
                        alphabets: false,
                        upperCaseAlphabets: false,
                        lowerCaseAlphabets: false,
                        specialChars: false,
                    });
                    console.log(OTP);
                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "Secounds Needle<charleslouis1234@gmail.com>",
                            pass: "tuytzbmtgdewseqp",
                        },
                    });
                    var mailOptions = {
                        from: "charleslouis1234@gmail.com",
                        to: userData.email,
                        subject: "Sample OTP Verification",
                        text:
                            "Hi" +
                            userData.name +
                            ",\n Welcome to Seconds Needle the first online watch shop.\n Enter the OTP to Log In " + OTP,
                    };
                    transporter.sendMail(mailOptions, function (error, info) { });
                    const Otp = new otp({ identifier: req.body.email, otp: OTP });
                    const salt = await bcrypt.genSalt(10);
                    Otp.otp = await bcrypt.hash(Otp.otp, salt);
                    const result = await Otp.save();
                    
                    
                    res.render("otp", { data: req.body.email });
                } else {
                    req.flash("notice", "User is already exists");
                    res.redirect("/otplog");
                }
            } else {
                req.flash("notice", "User is not found");
                res.redirect("/otplog");
            }
        } catch (error) {
            console.log("otp error");
            console.log(error.message);
        }
    },

    //------- if otp is wrong pop up message sending to pop up code

    otpVerify: async (req, res) => {
        try {
            const data = req.body.userDetails
            console.log(data);
            const userotp = req.body.otp;
            const otpholder = await otp.findOne({ identifier: data });
            console.log(otpholder);
            if (otpholder) {
                const validuser = await bcrypt.compare(userotp, otpholder.otp)
                console.log(validuser);
                if (validuser) {
                    req.session.user_id = req.body.userDetails;
                    await otp.deleteOne({ identifier: data })
                    res.redirect('/')
                } else {
                    req.flash("notice", "Your OTP is wrong")
                    res.redirect('/otplog')
                }
            } else {
                req.flash("notice", "You Used an expired otp")
                res.redirect('/otplog')
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    // mobile otp page--------------------//

    mobileOtp: async (req,res)=>{
        try{
            res.render('phoneotp')
        }catch(error){
            console.log(error.message);
        }
    },

    configmobotp: async(req,res)=>{
        try {
            const userData = await collection.findOne({ phone: req.body.mobile });
            // console.log(userData);
            if (userData) {
              if (userData.block === 0) {
                const OTP = otpgenerator.generate(4, {
                  digits: true,
                  alphabets: false,
                  upperCaseAlphabets: false,
                  lowerCaseAlphabets: false,
                  specialChars: false,
                });
                console.log(OTP);
          
                client.messages
                  .create({
                    body: `Welcome back to Your Seconds needle account, please enter the otp to signin ${OTP}`,
                    from: twilioNum,
                    to: userData.phone,
                  })
                  .then(async(message) => {
                    console.log("OTP sent successfully");
                
                    const salt = await bcrypt.genSalt(10);
                    const hashedOTP = await bcrypt.hash(OTP, salt);
                
                    const Otp = new otp({ identifier: req.body.mobile, otp: hashedOTP });
                    const result = await Otp.save();
                
                    res.render("otp", { data: req.body.mobile });
                  })
                  .catch((error) => {
                    console.error("Error sending OTP:", error);
                    res.status(500).json({ error: "Error sending OTP" });
                  });
              } else {
                // Handle the case when userData.block is not 0
                res.status(400).json({ error: "User is blocked" });
              }
            } else {
              // Handle the case when userData is not found
              res.status(404).json({ error: "User not found" });
            }
          } catch (error) {
            console.error("Error finding user:", error);
            res.status(500).json({ error: "Error finding user" });
          }
        },
          

    product: async (req, res) => {
        try {
            const productdetails = await Product.find({})
            res.render('products', { product: productdetails, title:req.session.user_id  })
        } catch (error) {
            console.log(error.message)
        }
    },

    selectedProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.query.id);//-----------------------------
            res.render('selectedProduct',{ product: product, title: req.session.user_id })//----------------------------------
        } catch (error) {
            console.log(error.message);
        }
    },

    addAddress:async(req,res)=>{
        try{
            const userid = req.session.user_id;
            res.render('address',{session:userid,title:userid})
        }catch(error){
            console.log(error.message);
        }
    },

    newAddress:async(req,res)=>{
        try{
        console.log(req.session.user_id);
        // const userdetails = await collection.findOne({ _id: req.session.user_id})
        // console.log(userdetails);
            const address = new useraddress({
                userid: req.session.user_id,
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                State: req.body.state,
                Pincode: req.body.pincode,
                phone: req.body.phonenumber,
                landmark: req.body.landmark,
              });
              await address.save();
              res.redirect("/checkout");  
             
        }catch(error){
            console.log(error.message);
        }
    },

    editAddress: async(req,res)=>{   
        try{
            const userAddress=await useraddress.findById({_id : req.query.id})
            res.render("editAddress",{useraddress:userAddress})
        }
        catch(error){
            console.log(error.message);
        }
    },

    updateAddress: async(req,res)=>{
        try{
            let editAddress;
                    editAddress={
                        name: req.body.name,
                        address: req.body.address,
                        city: req.body.city,
                        State: req.body.state,
                        Pincode: req.body.pincode,
                        phone: req.body.phonenumber,
                        landmark: req.body.landmark,
                    }
                     await useraddress.updateOne(
                        {_id:req.body.id},
                        {$set: editAddress},
                        {new:true}
                    );
                res.redirect('/userdash')
        }catch(error){
            console.log(error.message);
        }
    },

    deleteAddress: async(req,res)=>{
        try{
            await useraddress.findByIdAndDelete(req.query.id)
            res.redirect("/userdash")

        }catch(error){
            console.log(error.message);
        }
    },

    orderStatus: async(req,res)=>{
        try{
            res.render('orderStatus')
        }catch(error){
            console.log(error.message);
        }
    },

    searchData:async(req,res)=>{
        try{
            const proname=req.body.pname
            const usersession=req.session.userid
            let productnamelower= proname.toLowerCase().replace(/\s/g,"");
            const data=await collection.findOne({email:usersession})   
            
            const product_data = await product.find({productnamelower:{$regex: '.*'+productnamelower+'.*',$options:'i'}})
            
            res.render('products',{products:product_data,session:usersession,title:"Hi, "+data.name, session:usersession})
        }catch(error){
            res.status(404).render('error',{error:error.message})
        }

    }
}

module.exports = userPage