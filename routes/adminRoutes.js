

const express = require('express');
const config = require('../config/config');
const upload = require("../middleware/multer");

const adminRouter = express();
const auth = require('../middleware/adminAuth');
const session = require('express-session');
const multer=require('multer')


const adminController = require('../controller/adminController');
const productsController =require('../controller/productController');
const categoryController = require('../controller/categoryController')
const OrderController = require('../controller/order')


adminRouter.set('view engine', 'ejs');
adminRouter.set('views', './views/admin');
adminRouter.use(express.json());


adminRouter.use(session({

    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000000 
    }
}));

// Admin login routes
adminRouter.get('/',auth.isLogout, adminController.getAdminLogin);
adminRouter.post('/',adminController.verifyAdminLogin); 
adminRouter.get('/home',adminController.loadAdminHome);
adminRouter.get('/usermanagement',adminController.userManagement)

adminRouter.get('/category',categoryController.loadCategory)
adminRouter.get('/addCategory',categoryController.loadAddCategory)
adminRouter.post('/addCategory',categoryController.addCategory)
adminRouter.get('/editCategory/:id',categoryController.editCategory)
adminRouter.post('/editCategory',categoryController.addEditCategory)
adminRouter.get('/orders',OrderController.getOrder)




adminRouter.get('/products',adminController.getproducts)
adminRouter.get('/addproducts',productsController.getAddProducts)
adminRouter.post('/addproducts',upload.array("image",3),productsController.postproducts)
adminRouter.get('/editproducts',productsController.productedit)
adminRouter.post('/editproducts', upload.array("image",3),productsController.posteditproducts)
adminRouter.post('/removeimage',productsController.removeimage)

// adminRouter.get('/Orders',OrderController.LoadOrder)

module.exports = adminRouter; 
