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


userRouter.get('/home', userController.loadHome);
userRouter.get('/shop',userController.loadShop);
userRouter.get('/productdetail', userController.productDetail);
userRouter.get('/logout', auth.isLogin, userController.userLogout);
userRouter.get('/block',userController.blockUser)
userRouter.get('/unblock',userController.unblockUser)
userRouter.get('/cart',auth.isLogin,cartController.loadCart)
userRouter.get('/addtocart',auth.isLogin,cartController.addToCart)
userRouter.get('/profile',auth.isLogin,userController.detaileprofile)
userRouter.get('/checkout',auth.isLogin,orderController.loadCheckout)

userRouter.get('/addAddressList',userController.loadAddressList);
userRouter.get('/addAddress',userController.loadAddAddress);
userRouter.get("/addressList", auth.isLogin, userController.loadAddressList);

userRouter.get('/editAddress',auth.isLogin,userController.loadEditAddress);
userRouter.get('/deleteAddress',auth.isLogin,userController.deleteAddress);
userRouter.get('/orderPlaced',auth.isLogin,orderController.loadOrderPLaced)
userRouter.post('/placeOrder',auth.isLogin,orderController.placeOrder)

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
userRouter.post('/removeCartItem',auth.isLogin,cartController.removeItemCart)

module.exports = userRouter;

