let checkStock = async (user) => {
  let flag = 0;
  const Cart = await cart
    .findOne({ userID: user })
    .populate("products.productid");
  //   console.log(Cart);
  for (const products of Cart.products) {
    const pro = await product.findOne({ _id: products.productid });
    console.log(pro);
    if (products.Cartquantity > pro.quantity) {
      flag = 1;
      break;
    }
  }
  console.log(flag);
  return flag;
};