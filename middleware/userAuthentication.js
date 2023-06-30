const user = require("../models/userData")
const Banner = require('../models/banner')
const isLogin = async (req, res, next) => {

    try {
        if (req.session.user_id) {
            next()
        } else {
            const banners = await Banner.find({})
            res.render('home',{banner:banners})
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/signin');
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
};
const signinLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next()

        } else {
            res.redirect('/signin')
        }
    } catch (error) {
        console.log(error.message);
    }
};
const isBlocked = async (req, res, next) => {
    try {
        const User = await user.findOne({ _id: req.session.user_id });
        if (User.block == 1) {
            req.session.destroy();
            res.render("home", { notice: "User has been blocked" });
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = { isLogin, isLogout, signinLogin, isBlocked };