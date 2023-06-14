const mongoose=require('mongoose')

const brandSchema= mongoose.Schema({
    brandName:{
        type:String,
        required:true
    },
    brandDescription:{
        type:String,
        required:true
    },
    list:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model("Brand",brandSchema)