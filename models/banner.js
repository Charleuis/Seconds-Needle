const banner = require('mongoose')

const bannerSchema= new banner.Schema({
    title:{
        type: String,
        required: false,
    },
    image:{
        type: Array,
        required: true,
    },
    link:{
        type:String,
        required: true,
    },
    description:{
        type: String,
        required: true
    }
})
module.exports = banner.model('bannerModel', bannerSchema);

