const User = require ("../models/usermodel");
const bcrypt= require("bcrypt");
const admin = require('../models/adminmodel')
const products = require('../models/productModels');
const categorycollection= require('../models/categoryModel')

const getAdminLogin = async (req, res) => {
  res.render("adminlogin")
  }
  
const verifyAdminLogin = (req, res) => {
    try {
     const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {

            return res.render('adminlogin', { message: " Please fill out all the fields " });

        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {

            req.session.email = email;
            res.redirect('home'); 

        } else {
            res.render('adminlogin', { message: 'Email or password is incorrect' })
        }

    } catch (error) {
        console.log('error is on admins verifyLogin method :-  ', error.message);
    }
  };
  
  const loadAdminHome = async (req, res) => {
    try {
      console.log('Loaded Admin Home');
      res.render('home');
    } catch (error) {
      console.log(error);
    }
  }

  const userManagement = async (req, res) => { 
    try {
      const data = await User.find();
      res.render("usermanagement", { user : data });
    } catch (error) {
      console.log(error.message);
    }
  };


  const getCategory = async (req,res)=> {
    try {
         data1 =await categorycollection.find();
        res.render("category");
    } catch (error) {
     console.log(error);   
    }
  }


  const getproducts= async (req,res)=>{
    try {
        const data =await products.find().populate("category");
        res.render("products",{products:data});
    } catch (error) {
        
    }
  }


 
  
  module.exports = {
    getAdminLogin,
    verifyAdminLogin,
    loadAdminHome,
    userManagement,
    getCategory,
    getproducts
  };
  