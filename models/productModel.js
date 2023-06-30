const product = require('mongoose')

const userInSchema = new product.Schema({
  productname: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  Gender:{
    type:String,
    required:true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type:String,
    default:"Yes"
  },
  productimage: {
    type: Array,
    required: true,
    validate: [arrayLimit, "maximum 4 product images allowed"]
  }
});

function arrayLimit(val) {
  return val.length <= 4;
}

module.exports = product.model('product', userInSchema);

