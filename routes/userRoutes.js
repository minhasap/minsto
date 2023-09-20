const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middleware/auth');
const nocache = require('nocache');


const userRouter = express();

userRouter.use(express.urlencoded({ extended: false }));
userRouter.use(express.json());
userRouter.use(cookieParser());
userRouter.use(nocache());
const cartController = require('../controller/cartController');
const userController = require('../controller/usercontroller');
const orderController = require('../controller/order');
const couponController= require('../controller/coupenController')
userRouter.set('view engine', 'ejs');
userRouter.set('views', './views/user');


const bodyParser = require('body-parser');
userRouter.use(express.json()); // To parse JSON data
userRouter.use(express.urlencoded({ extended: true }));

const isBlockedd = require('../middleware/blocked')
userRouter.get('/', userController.loadHome);

userRouter.get('/login',auth.isLogout,userController.loginLoad)
userRouter.get('/signup',auth.isLogout,userController.loadSignup)
userRouter.get('/otp', userController.loadOTP);
userRouter.get('/resendotp', userController.resendOTP);
userRouter.get('/resendotplogin', userController.resendOTP);


userRouter.get('/home', auth.blockedstatus,userController.loadHome);
userRouter.get('/shop',auth.blockedstatus,userController.loadShop);
userRouter.get('/productdetail',auth.blockedstatus, userController.productDetail);
userRouter.get('/logout', auth.isLogin, userController.userLogout);
userRouter.get('/block',userController.blockUser)
userRouter.get('/unblock',userController.unblockUser)
userRouter.get('/cart',auth.blockedstatus,auth.isLogin,cartController.loadCart)
userRouter.get('/addtocart',auth.blockedstatus,auth.isLogin,cartController.addToCart)
userRouter.get('/Wishlist',auth.isLogin,userController.loadWishlist)
userRouter.post('/Wishlist',auth.isLogin,userController.addtowishlist)
// userRouter.get('/addtowishlist',auth.isLogin,userController.addtowishlist)
userRouter.get("/addtowishlist",auth.isLogin,nocache(),userController.addtowishlist);


userRouter.get('/profile',auth.isLogin,userController.detaileprofile)
userRouter.get('/checkout',auth.isLogin,orderController.loadCheckout)

userRouter.get('/addAddressList',userController.loadAddressList);
userRouter.get('/addAddress',userController.loadAddAddress);
userRouter.get("/addressList", auth.isLogin, userController.loadAddressList);

userRouter.get('/editAddress',auth.isLogin,userController.loadEditAddress);
userRouter.get('/deleteAddress',auth.isLogin,userController.deleteAddress);

userRouter.get("/updateProfile", auth.isLogin, userController.loadUpdateData);
userRouter.post("/updateProfile", auth.isLogin, userController.updateData);


userRouter.get('/orderPlaced',auth.isLogin,orderController.loadOrderPLaced)
userRouter.post('/placeOrder',auth.isLogin,orderController.placeOrder)
userRouter.get('/viewOrders',auth.isLogin,orderController.loadOrderList)
userRouter.get('/cancelOrder',auth.isLogin,orderController.cancelOrder);



userRouter.get("/wallethsitory", auth.isLogin, userController.loadWalletHistory);



userRouter.post('/addAddress',userController.addAddress);
userRouter.post('/addCheckoutAddress', orderController.addAddress);
userRouter.post('/editAddress',auth.isLogin,userController.editAddress);
userRouter.post('/checkotp', userController.verifyOTP);
userRouter.post('/login',isBlockedd, userController.verifyLogin);
userRouter.post('/signup', userController.insertUser);
// userRouter.post('/signup',userController.loadSignup)
userRouter.post('/', userController.verifyLogin);

userRouter.post('/addtocart',auth.isLogin,cartController.addToCart);
userRouter.post('/changeQty',auth.isLogin,cartController.changeQty)
userRouter.post('/removeCartItem',auth.isLogin,cartController.removeItemCart);
userRouter.post('/removeWish',auth.isLogin,userController.removeWishItem);

userRouter.post('/verifyPayment', orderController.verifyPayment);
userRouter.post('/applyCoupon',couponController.applyCoupon);


module.exports = userRouter;  

