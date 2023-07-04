const {Schema,model}= require('mongoose')

const otpschema= new Schema({
    identifier:{
        type:String,
        required:true
    },
    otp:{
        type: String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        index: { expires: 30 },
    }
});

const otp = model("Otp",otpschema);

module.exports=otp

