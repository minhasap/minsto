const mongoose=require('mongoose');

const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const Product = require('../models/productModels');
const Category = require('../models/categoryModel')
const Orders = require('../models/orderModel')
const {otpGen} = require('../controller/OTPcontroller');
require("dotenv").config();
// const { ObjectId } = require("mongodb");
const { query } = require("express");
const ObjectId = mongoose.Types.ObjectId;

const Cart = require ('../models/cartmodel');


const express = require('express');
const { userManagement } = require('./adminController');
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



const securePassword = async (password) => {
    try {
        const saltRounds = 10;
        const passwordHash = bcrypt.hashSync(password, saltRounds);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};



const sendOTP = async (name, email, otp,) => {
    try {

    // const transporter = nodemailer.createTransport({
        //     host: "smtp.gmail.com",
        //     port: 465,
        //     secure: true,
        //     // service: 'gmail',
        //     // requireTLS: true,
        //     auth: {
        //         user: "projectsminhas@gmail.com",
        //         pass: "triddewvfzlgsfal"
        //     }
        // });
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user:process.env.NODEMAILER_EMAIL ,
                pass: process.env.NODEMAILER_PASS 
            }
        });
        

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Your OTP',
            text: `WELCOME TO FOOTWEAR SHOPPING PLATFORM.\n \n Your OTP IS \n\n ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(" Email has been sent", info.response);
            }
        });

    } catch (error) {
        console.log("error is on sendOTP method", error.message);
    }
}



const OTP = otpGen();


const loadSignup = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
};
const insertUser = async (req, res) => {
    try {
        let userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        };

        req.session.userData = userData;

        if (!req.body.firstName || !req.body.lastName || !req.body.userName || !req.body.email || !req.body.phone || !req.body.password || !req.body.re_password) {
            return res.render('signup', { messageFailed: " Please fill out all the fields ", userData: userData });
        }

        const isNewName = await User.isExistingUserName(req.body.userName);
        if (!isNewName) {
            return res.render('signup', { 
                messageFailed: "Existing Username",
                userData: userData
            });
        }

        const isNewPhone = await User.isExistingPhone(req.body.phone);
        if (!isNewPhone) {
            return res.render('signup', {
                messageFailed: "Existing phone number",
                userData: userData
            });l
        }

        const isNewEmail = await User.isExistingEmail(req.body.email);
        if (!isNewEmail) {
            return res.render('signup', {
                messageFailed: 'Existing Email address. Please try to Log - In',
                userData: userData
            });
        }

        req.session.otp = OTP;
        sendOTP(userData.userName, userData.email, userData.phone, OTP);
        res.redirect('/otp');
    } catch (error) {
        console.log('in insertUser method', error.message);
    }
}


 
const loadOTP = async (req, res) => {

    try {

        res.render('otp', { email: req.session.email });

    } catch (error) {
        console.log('loadOTP method', error.message);
    }
};

const resendOTP = async (req, res) => {

    try {
console.log("otppppp");
        sendOTP(req.session.userData.userName, req.session.userData.email, OTP);
        console.log(userName);

    } catch (error) {
        console.log('resendOtp method', error.message);
    }

};

const verifyOTP = async (req, res) => {

    try {

        const { val1, val2, val3, val4, val5, val6 } = req.body;

        const formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6);

        if (formOtp == OTP) {
            const { firstName, lastName, userName, email, phone, password } = req.session.userData;

            const secPassword = await securePassword(password);
            const user = new User({

                firstName: firstName,
                lastName: lastName,
                phone: phone,
                userName: userName,
                email: email,
                password: secPassword,

            });

            const userData = await user.save();

            if (userData) {
                res.render('login', { message: 'Registration Success' });
            } else {
                res.render('signup', { messageFailed: 'Registarion Failed' })
            }
        } else {
            res.render('signup', { messageFailed: 'Incorrect OTP' })
        }

    } catch (error) {
        console.log('in VerifyOTP:- ', error.message);
    }

};

// loginuser 

const loginLoad = async (req, res) => {

    try {

        let bMessage;
        if (req.session.blockedMessage) {
            bMessage = req.session.blockedMessage;
            req.session.blockedMessage = null;
        }

        res.render('login', { message: bMessage });

    } catch (error) {
        console.log(error.message)
    }

}


const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(password,email);

        if (!email || !password) return res.render('login', { message: " Please fill all the fields " });

        const userData = await User.findOne({ email: email });

        if (userData) {

            // if (userData.is_blocked == 1) return res.render('login', { message: " Your Acoount Is currently Blocked " });

            const isMatchingPassword = await bcrypt.compare(password, userData.password);

            if (isMatchingPassword) {

                 req.session.otp = OTP;
        sendOTP(userData.userName, userData.email, userData.phone, OTP);
        res.redirect('/otp');

            } else {
                res.render('login', { message: 'Email or password is incorrect' });
            }
        } else {
            res.render('login', { message: 'Email or password is incorrect' });
        }
    } catch (error) {
        console.log(error);
        res.render('login', { message: 'An error occurred. Please try again.' });
    }
};

// Home 
const loadHome = async (req, res) => {
    try {
      
        if (req.session.user_id) {
        }

        const data = await Product.find();

        res.render('home', {
            req: req,
            products: data,
        
        });
    } catch (error) {
        console.log('loadHome Method: ', error.message);
    }
}

// logout 
const userLogout = async (req, res) => {

    try {

        req.session.destroy();
        res.redirect('/')

    } catch (error) {
        console.log('Logout Method :-  ', error.message);
    }

}

const blockUser =async (req,res)=>{
    try {
        console.log("blooookkkkk");
        const userData=await User.findOne({_id:req.query.id})
        if(userData){
            await User.updateOne({_id: userData._id},{$set:{status:true}})
            res.redirect("admin/usermanagement")
        }
    } catch (error) {
      console.log(error); 
    }
  }

  const unblockUser =async (req,res)=>{
    try {
        const userData =await User.findOne({_id: req.query.id})
        if(userData){
            await User.updateOne({_id:userData._id},{$set:{status:false}});
            res.redirect("admin/userManagement")
        }
    } catch (error) {
      console.log(error);  
    }
  }

  const loadShop = async (req, res) => {
    try {
        const category = await Category.find();

        const data = await Product.find();
        if(req.session.userData && req.session.userData._id){
            const cart = await Cart.findOne({user: req.session.userData._id});
            if(cart?.products){
                req.session.length = cart.products.length;
            }
        }

        res.render('shop', {
            req: req,
            products: data,

        
        });
        
    } catch (error) {
        console.log("shop error");
    }
};


const productDetail = async (req, res) => {
    try {
     const id = req.query.id;
    
     console.log(id);
     
     const data = await Product.findById(id).populate("category");
    
   
        if(data){
            res.render('productdetail', {
              products:  data,
              req: req,
            });
            
        }
        
    } catch (error) { 
        console.log("shop error");
    }
};
let length = 0;
const detaileprofile = async (req, res) => {

    try {
 
       const userData = req.session.userData;
       const orderLength = await Orders.find({ user: userData._id }).count();
      
       const cart = await Cart.findOne({ user: req.session.userData._id });
 
       const user = await User.findOne({ email: userData.email });
       length = cart.products.length;
 
       res.render('profile', {
          user: user,
          req: req,
          length,
          orderLength,
       })
 
    } catch (error) {
       console.log("LoadProfile Method :- ", error.message);
    }
 
 };

 
const loadAddressList = async (req, res) => {

    try {
 
       const userData = req.session.userData;
 
       const user = await User.findOne({ email: userData.email });
       const address = user.address;
 
       if (address.length) {
 
          res.render('addressList', {
             user,
             address,
             req,
             length
          });
 
       } else {
          res.render('addressList', { user, data: 1, req });
       }
 
 
    } catch (error) {
       console.log('loadAddressList Method :-  ', error.message);
    }
 
 }
 
 const loadAddAddress = async (req, res) => {
 
    try {
 
       res.render('add-address', { req: req })
 
    } catch (error) {
       console.log('loadAddAddress Method :-  ', error.message);
    }
 
 };
 const addAddress = async (req, res) => {
    try {
       if (req.session.userData && req.session.userData._id) {
          const { firstName, lastName, address, street, state, city, zipCode, phone, type, country } = req.body;
 
          if (!firstName || !lastName || !address || !street || !state || !city || !zipCode || !phone || !type || !country) {
             return res.render('add-address', { req, message: 'Please fill all the fields' });
          }
          const namePattern = /^[A-Za-z]+$/;

          if (!firstName.match(namePattern) || !lastName.match(namePattern)) {
            return res.render('add-address', { req, message: 'Invalid name format' });
        }
        if (typeof firstName !== 'string' || typeof lastName !== 'string') {
            return res.render('add-address', { req, message: 'Invalid input format' });
        }
          // Basic phone number validation
          const phonePattern = /^\d{10}$/; // Change the pattern based on your requirements
          if (!phone.match(phonePattern)) {
             return res.render('add-address', { req, message: 'Invalid phone number format' });
          }
 
          const id = req.session.userData._id;
          const data = await User.findOneAndUpdate(
             { _id: id },
             {
                $push: {
                   address: {
                      firstName,
                      lastName,
                      address,
                      phone,
                      city,
                      street,
                      state,
                      zipCode,
                      type,
                      country,
                   }
                }
             },
             { new: true } 
          );
          res.redirect('/addressList');
       } else {
          res.redirect('/login');
       }
    } catch (error) {
       console.log('addAddress Method :-  ', error.message);
    }
 };
 
  
const loadEditAddress = async (req,res)=>{
    try {
        if(req.session.userData._id){
            const address = await User.findOne({_id:req.session.userData._id,'address._id': req.query.id}).lean();
       const data = address.address.find(a=> a._id.toString()=== req.query.id);
       res.render('edit-address',{req: req,data:data});

        }else{
            res.redirect('/login');

        }
    } catch (error) {
        console.log('load address methode error ',error.message);
    }
};


const editAddress = async (req, res) => {

    try {
 
       if (req.session.userData._id) {
 
          const { firstName, lastName, address, street, state, city, zipCode, phone, type, country } = req.body;
 
          if (!firstName || !lastName || !address || !street || !state || !city || !zipCode || !phone || !type || !country) return res.render('edit-address', { req, message: 'please Fill all the fields' })
 
          const addressId = req.body.id;
          const userId = req.session.userData._id;
          const userData = await User.findOne({ _id: userId, 'address._id': addressId });
 
          await User.updateOne(
             { _id: userId, "address._id": addressId },
             {
                $set: {
                   "address.$.firstName": firstName, 
                   "address.$.lastName": lastName,
                   "address.$.address": address,
                   "address.$.phone": phone,
                   "address.$.city": city,
                   "address.$.street": street,
                   "address.$.state": state,
                   "address.$.zipCode": zipCode,
                   "address.$.type": type,
                   "address.$.country": country,
                }
             }
          );
          res.redirect('/addressList');
       } else {
          res.redirect('/login');
       }
 
    } catch (error) {
       console.log('editAddress Method :-  ', error.message);
    }
 
 };
 



const deleteAddress = async (req, res) => {

   try {

      if (req.session.userData._id) {

         const userId = req.session.userData._id;
         const addressId = req.query.id;

         await User.updateOne(
            { _id: userId },
            {
               $pull: {
                  address: {
                     _id: addressId,
                  }
               }
            }
         );
         res.redirect('/addressList')

      } else {
         res.redirect('/login');
      }

   } catch (error) {
      console.log('deleteAddress Method :-  ', error.message);
   }

};



module.exports = {

    loadSignup,
    insertUser,
    loadOTP,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    resendOTP, 
    verifyOTP,
    blockUser,
    unblockUser,
    loadShop,
    productDetail,
    detaileprofile,
    loadAddressList,

    addAddress,
    loadAddAddress,
    loadEditAddress,
    editAddress,

     deleteAddress 

};





// <div class="row row-pb-md">

    
        
        

// <div class="col-lg-3 mb-4 text-center">
    
//     <div class="product-entry border">
        
        
//         <div class="desc">
            



//             <a href="/productdetail?id=<%= products._id%>" class="prod-img">
//                 <img src="/productImages/<%= products.image[0] %>" class="img-fluid" alt="Free html5 bootstrap 4 template " onclick="location.href='/productdetail?id=<%=products._id%>'">
//             </a>
//             <h2><a href="productdetail"><%= products.productname %></a></h2>
//             <span class="price">Price <%= products.price %>/-</span>
            
//         </div> 
//     </div>
// </div>

                    



    
// </div>



