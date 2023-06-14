require('dotenv').config();
const express = require('express')
const app = express();
const PORT = process.env.PORT || 7800
const path = require('path')
const mongoose = require('mongoose')

//mongodb connection
mongoose.connect(process.env.dbconnect)
    .then(() => {
        console.log('mongodb Connected');
    }).catch(() => {
        console.log('Error in mongodb connecting');
    })

const userRoute = require('./routers/userRoute')       //user Router
const adminRoute = require('./routers/adminRoute')     // admin Router

//Home page of User
app.use('/', userRoute)
app.use('/admin', adminRoute)

//Port Creation
app.listen(PORT, () => { console.log("the Port is Created") })