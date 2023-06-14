const mongoose=require('mongoose')

const categorySchema= mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    categoryDescription:{
        type:String,
        required:true
    },
    categorylower:{
        type:String,
        require:true,
    },
    // list:{
    //     type:Number,
    //     default:0
    // }
    status:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model("Category",categorySchema)