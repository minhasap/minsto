const User = require('../models/usermodel');
const Product = require('../models/productModels');
const Cart = require('../models/cartmodel');
const Order = require('../models/orderModel');
const fs = require('fs');

const {default:mongoose}= require('mongoose');






let length = 0;

const loadCheckout = async (req, res) => {
   try {
      if (req.session.userData._id) {
         const userId = req.session.userData._id;
         const user = await User.findOne({ _id: userId });
         const cartData = await Cart.findOne({ user: userId }).populate("products.product_id");
         length = req.session.length

         if (cartData.products && cartData.products.length > 0) {
            const total = await Cart.aggregate([
               {
                  $match: { user: new mongoose.Types.ObjectId(userId) },
               },
               {
                  $unwind: "$products",
               },
               {
                  $project: {
                     price: "$products.price",
                     quantity: "$products.quantity",
                  },
               },
               {
                  $group: {
                     _id: null,
                     total: {
                        $sum: {
                           $multiply: ["$quantity", "$price"],
                        },
                     },
                  },
               },
            ]).exec();

            if (total.length > 0 && total[0] !== undefined) {
               const Total = total[0].total;
               res.render("checkout", {
                  products: cartData.products,
                  address: user.address,
                  total: Total,
                  wallet: user.wallet,
                  req: req,
                  length,
               });
            } else {
               res.render("checkout", {
                  noData: true
               });
            }
         } else {
            console.log("There is nothing to checkout.");
         }
      } else {
         res.redirect("/");
      }
   } catch (error) {
      console.log("loadCheckout Method: ", error.message);
   }
};



const addAddress = async (req, res) => {

    try {
 
       if (req.session.userData && req.session.userData._id) {
 
          const { firstName, lastName, address, street, state, city, zipCode, phone, type, country } = req.body;
 
          if (!firstName || !lastName || !address || !street || !state || !city || !zipCode || !phone || !type || !country) return res.render('checkout', { req, message: 'please Fill all the fields' })
 
 const namePattern = /^[A-Za-z]+$/;

          if (!firstName.match(namePattern) || !lastName.match(namePattern)) {
            return res.render('checkout', { req, message: 'Invalid name format' });
        }
        if (typeof firstName !== 'string' || typeof lastName !== 'string') {
            return res.render('checkout', { req, message: 'Invalid input format' });
        }
          // Basic phone number validation
          const phonePattern = /^\d{10}$/; // Change the pattern based on your requirements
          if (!phone.match(phonePattern)) {
             return res.render('checkout', { req, message: 'Invalid phone number format' });
          }
 


          
          const id = req.session.userData._id;
          const data = await User.findOneAndUpdate(
             { _id: id },
             {
                $push: {
                   address: {
 
                      firstName: firstName,
                      lastName: lastName,
                      address: address,
                      phone: phone,
                      city: city,
                      street: street,
                      state: state,
                      zipCode: zipCode,
                      type: type,
                      country,
 
                   }
                }
             },
             { new: true }
          );
          res.redirect('/checkout')
 
       } else {
          res.redirect('/checkout')
       }
 
    } catch (error) {
       console.log('addAddress Method :-  ', error.message);
    }
 };
 
 const loadOrderPLaced = async (req, res) => {

   try {

      const cart = await Cart.findOne({ user: req.session.userData._id });
      if (cart?.products) {
         length = cart.products.length;
      }

      res.render('order-complete', { req, length })

   } catch (error) {
      console.log('loadOrderPLaced Method :-  ', error.message);
   }

};



function generateOrderId(length = 16, includeTimestamp = true) {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const timestamp = includeTimestamp ? Date.now().toString() : '';

   let randomChars = '';
   for (let i = 0; i < length - timestamp.length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomChars += chars[randomIndex];
   }

   return includeTimestamp ? timestamp + randomChars : randomChars;
}

const placeOrder = async (req,res) => {
   try {
      if (req.session.userData && req.session.userData._id) {
         const userId = req.session.userData._id;
         const { total, address,  addressId } = req.body;

         const user = await User.findById(userId);

         if (address === null) return res.json({ codFailed: true });

         const cartData = await Cart.findOne({ user: user._id });
         const cartProducts = cartData.products;
      

         let wall;
         let cod;
         if (user.wallet < total) {
            wall = 10;
            cod = user.wallet - total - 10
         } else {
            wall = user.wallet - total;
            cod = 0;
         }

         const orderId = generateOrderId(16, true);
         const newOrder = new Order({
            deliveryAddress: address,
            addressId,
            user: userId,
            // paymentMethod: payment,
            products: cartProducts,
            totalPrice: total,
            orderDate: new Date(),
            // status: status,
            wallet: wall,
            discount: 0,
            couponCode: '',
            orderId,
            codAmount: cod
         });

         const outOfStockProducts = [];

         for (const product of cartProducts) {
            const productData = await Product.findById(product.product_id);
            if (!productData || productData.quantity < product.quantity) {
               outOfStockProducts.push(product.product_id);
            }
         }

         if (outOfStockProducts.length > 0) {
            return res.json({ outOfStockProducts });
         }

         await newOrder.save();
         const orderid = newOrder._id

         if (newOrder.status === 'Placed') {

            await User.findByIdAndUpdate(userId,
               {
                  $set: { wallet: wall },
                  $push: {
                     wallehistory: {
                        amount: wall,
                        date: new Date().toISOString().substring(0,10),
                        transaction: "Debit",
                        description: "Order Placed"
                     }
                  }
               },
            );
            await Cart.deleteOne({ user: userId });

            for (const product of cartProducts) {
               await Product.findByIdAndUpdate(product.product_id, {
                  $inc: { quantity: -product.quantity },
               });
            }

            res.json({ codSuccess: true });
         } else {
            const options = {
               amount: total * 100,
               currency: 'INR',
               receipt: '' + orderid,
            };

            instance.orders.create(options, function (err, order) {
               if (err) {
                  console.log(err);
               }
               res.json({ order });
            });
         }
      } else {
         res.redirect('/login');
      }
   } catch (error) {
      console.log('placeOrder Methoddd: ', error.message);
   };
};




const verifyPayment = async (req, res) => {

   try {

      if (req.session.userData && req.session.userData._id) {

         const userId = req.session.userData._id;
         let user = await User.findById(userId);
         const cart = await Cart.findOne({ user: user._id });
         const products = cart.products;

         const details = req.body;

         const crypto = require('crypto');

         let hmac1 = crypto.createHmac("sha256", process.env.RAZOR_SECRET);

         hmac1.update(
            details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']
         );
         hmac1 = hmac1.digest('hex');

         if (hmac1 == details['payment[razorpay_signature]']) {

            let orderRecipt = details['order[receipt]'];
            const newOrder = await Order.find().sort({ date: -1 }).limit(1);
            const newId = newOrder.map((value) => {
               return value._id;
            });

            await Order.findByIdAndUpdate(
               newId,
               { $set: { paymentId: details['payment[razorpay_payment_id]'] } }
            )

            await Order.findByIdAndUpdate(orderRecipt,
               {
                  $set: { status: 'Placed' }
               }
            );

            await Cart.deleteOne({ user: userId });

            for (let i = 0; i < products.length; i++) {

               const productId = products[i].product_id;
               const quantity = Number(products[i].quantity);
               await Product.findByIdAndUpdate(productId, {
                  $inc: { quantity: -quantity }
               });

            }
            res.json({ success: true });

         } else {

            await Order.deleteOne({ _id: details['order[receipt]'] });
            res.json({ onlineSuccess: true });

         }

      } else {
         res.redirect('/login');
      }

   } catch (error) {
      console.log('verifyPayment Method :-  ', error.message);
   }

}


const checkWallet = async (req, res) => {
   try {
      if (req.session.userData && req.session.userData._id) {
         const userId = req.session.userData._id;
         const userData = await User.findOne({ _id: userId });
         const wallet = userData.wallet;

         if (wallet > 0) {
            res.json({ success: true, wallet });
         } else {
            res.json({ success: false, message: "Wallet amount is zero." });
         }
      } else {
         res.redirect('/login');
      }
   } catch (error) {
      console.log('checkWallet Method:', error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
   }
};


const loadOrderList = async (req, res) => {
   try {
      const user = await User.findById(req.session.userData._id);
      const orders = await Order.find({ user: user._id }).sort({ orderDate: -1 })
      const products = await Product.find({});

      const cart = await Cart.findOne({ user: user._id });
      if (cart && cart.products) {
         length = cart.products.length;
      }


      const orderProduct = {};
      const productsArray = {};

      const returnValid = new Date();
      returnValid.setDate(returnValid.getDate() - 10);

      for (const order of orders) {
         if (order.products && order.products.length > 0) {
            const productId = order.products[0].product_id;
            const product = products.find((p) => p._id.equals(productId));
            if (product && product.image && product.image.length > 0) {
               orderProduct[order._id] = product;
            }
            const productsOfOrder = [];

            order.products.forEach(p=>{
               const productDetail = products.find(product => product._id.equals(p.product_id));
               if (productDetail) {
                  productsOfOrder.push(productDetail);
               }
            });

            productsArray[order._id]=productsOfOrder;
         }
      }
      res.render("orderLists", { productsArray, req, length, orders, user, orderProduct, returnValid });

   } catch (error) {
      console.log("loadOrderList Method: ", error.message);
   }
};


module.exports ={
    loadCheckout,
    placeOrder,
    checkWallet,
    loadOrderPLaced,
    addAddress,
    verifyPayment,
    loadOrderList,
    

}

