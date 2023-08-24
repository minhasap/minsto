const productscollection = require("../models/productModels");
const categorycollection= require("../models/categoryModel")
const upload = require("../middleware/multer")


const getAddProducts = async (req,res)=>{
    try {
       const category= await categorycollection.find().populate("category").lean();
       res.render("addproducts",{category});
    } catch (error) {
       console.log(error); 
    }
}
 const postproducts = async (req, res) => {
    try {
        const { productname, brand, price, description, quantity, category1 } = req.body;
   

        // Check if a product with the same name already exists
        const existingProduct = await productscollection.findOne({ productname: productname });
        const category = await categorycollection.find().populate("category").lean();
        if (existingProduct) {
            return res.render( "addproducts",{category, message: 'Product with the same name already exists' });
        }if (price <0 || quantity <0) {
            return res.render( "addproducts",{category, message: 'negetive value not support' });
        }

        const img = req.files.map((image) => image.filename);
        console.log(req.files);
        const product = new productscollection({
            productname: productname,
            brand: brand,
            price: price,
            description: description,
            quantity: quantity,
            category: category1,
            image: img,
        });

        const productdata = await product.save();
        if (productdata) {
            res.redirect("/products");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}


const productedit =async(req,res)=>{
    try{
        const categoryData =await categorycollection.find().lean();
        const id = req.query.id;
        const productData= await productscollection.findOne({_id: id}).lean();


        if (productData){
            res.render("editproducts",{

                user:productData,
                category: categoryData
            })
        }else{
            res.redirect("editproducts")
        }
    }catch (error){
        console.log(error);
    }
}
const posteditproducts =  async (req,res)=>{
    try {
        if(req.files){
            const existingproduct = await productscollection.findById(req.query.id);
            let images = existingproduct.image;
            req.files.forEach((file)=>{
                images.push(file.filename);
            })
            var img =images; 
        }


        await productscollection.updateOne(
            {_id:req.query.id},
            { $set :{
                productname: req.body.productname,
                brand: req.body.brand,
                price: req.body.price,
                description: req.body.description,
                quantity: req.body.quantity,
                category: req.body.categoryId, // Use the correct field name for category ID
                image: img,
            }}
        );
        res.redirect("products");
        
    } catch (error) {
        console.log(error);
    }
}


const removeimage = async (req,res)=>{
    try {
        let id =req.body.id;
        let position = req.body.position;
        let productImg = await productscollection.findById(id)
        let image = productImg.image[position];
        await productscollection.updateOne({_id:id},{$pullAll:{image:[image]}});
        res.json({remove : true});
    
    } catch (error) {
        res.render("admin/500");
        console.log(error);
    }
};






// <!DOCTYPE HTML>
// <html>
// 	<head>
// 	<title>Footwear - Free Bootstrap 4 Template by Colorlib</title>
//    <meta charset="utf-8">
//    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

//    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
//    rel="stylesheet">
//    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
	
// 	<!-- Animate.css -->
// 	<link rel="stylesheet" href="/user/css/animate.css">
// 	<!-- Icomoon Icon Fonts-->
// 	<link rel="stylesheet" href="/user/css/icomoon.css">
// 	<!-- Ion Icon Fonts-->
// 	<link rel="stylesheet" href="/user/css/ionicons.min.css">
// 	<!-- Bootstrap  -->
// 	<link rel="stylesheet" href="/user/css/bootstrap.min.css">

// 	<!-- Magnific Popup -->
// 	<link rel="stylesheet" href="/user/css/magnific-popup.css">

// 	<!-- Flexslider  -->
// 	<link rel="stylesheet" href="/user/css/flexslider.css">

// 	<!-- Owl Carousel -->
// 	<link rel="stylesheet" href="/user/css/owl.carousel.min.css">
// 	<link rel="stylesheet" href="/user/css/owl.theme.default.min.css">
	
// 	<!-- Date Picker -->
// 	<link rel="stylesheet" href="/user/css/bootstrap-datepicker.css">
// 	<!-- Flaticons  -->
// 	<link rel="stylesheet" href="/user/fonts/flaticon/font/flaticon.css">

// 	<!-- Theme style  -->
// 	<link rel="stylesheet" href="/user/css/style.css">

// 	<link href="https://fonts.googleapis.com/icon?family=Material+Icons"
//       rel="stylesheet">

// 	</head>
// 	<body>
		
// 	<div class="colorlib-loader"></div>

// 	<div id="page">
// 		<nav class="colorlib-nav" role="navigation">
// 			<div class="top-menu">
// 				<div class="container">
// 					<div class="row">
// 						<div class="col-sm-7 col-md-9">
// 							<div id="colorlib-logo"><a href="index.html">MinSto.</a></div>
// 						</div>
// 						<div class="col-sm-5 col-md-3">
// 			            <form action="#" class="search-wrap">
// 			               <div class="form-group">
// 			                  <input type="search" class="form-control search" placeholder="Search">
// 			                  <button class="btn btn-primary submit-search text-center" type="submit"><i class="icon-search"></i></button>
// 			               </div>
// 			            </form>
// 			         </div>
// 		         </div>
// 				 <div class="row">
// 					<div class="col-sm-12 text-left menu-1">
// 						<ul>
// 							<li class="active"><a href="home">Home</a></li>
//                             	<li><a href="shop">Shop</a></li>

// 							<li >
// 								<a href="#">men</a>
// 							</li>
// 							<li><a href="#">Women</a></li>
// 							<li><a href="#">About</a></li>
// 							<li><a href="#">Contact</a></li>
// 							<li class="cart">
// 								<% if (typeof length !== 'undefined') {%>
// 									<a href="/cart"><i class="icon-shopping-cart"></i> Cart [<%=length%>]</a>
// 								<%}else {%>
// 									<a href="/cart"><i class="icon-shopping-cart"></i> Cart [0]</a>
// 								<% } %>
// 							</li>

// 							<li class="has-dropdown cart">
								
// 								<a href="#"><span class="material-symbols-outlined">person</span></a>
// 								<ul class="dropdown">
										
										
// 												<li><a href="/userProfile">Profile</a></li>
// 												<li><a href="/viewOrders">Orders</a></li>
// 												<li><a href="/logout">logout</a></li>
// 												<li><a href="/">login</a></li>
										
// 									<!-- <li><a href="#">Checkout</a></li>
// 										<li><a href="#">Order Complete</a></li>
// 										<li><a href="#">Wishlist</a></li> -->
// 									</ul>
// 								</li>
// 							</li>
// 						</ul>
// 					</div>
// 				</div>
// 				</div>
// 			</div>
// 			<div class="sale">
// 				<div class="container">
// 					<div class="row">
// 						<div class="col-sm-8 offset-sm-2 text-center">
// 							<div class="row">
// 								<div class="owl-carousel2">
// 									<div class="item">
// 										<div class="col">
// 											<h3><a href="#">25% off (Almost) Everything! Use Code: Summer Sale</a></h3>
// 										</div>
// 									</div>
// 									<div class="item">
// 										<div class="col">
// 											<h3><a href="#">Our biggest sale yet 50% off all summer shoes</a></h3>
// 										</div>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</nav>

     


// 		<div class="row row-pb-md">
// 			<% for (let i = 0; i < products.length && i < 1; i++) { %>
// 				<div class="col-lg-3 mb-4 text-center">
// 					<div class="product-entry border">
// 						<a href="productdetail" class="prod-img">
// 							<img src="/productImages/<%= products[i].image[0] %>" class="img-fluid" alt="Free html5 bootstrap 4 template">
// 						</a>
// 						<div class="desc">
// 							<h2><a href="productdetail"><%= products[i].productname %></a></h2>
// 							<span class="price">Price <%= products[i].price %>/-</span>
// 						</div>
// 					</div>
// 				</div>
// 			<% } %>
// 		</div>
		


		
// 		<!-- <h2><a href="productdetail"><%= products.productname %></a></h2> -->
// 		<!-- <span class="price">Price <%= products.price %>/-</span> -->
		

// 		<footer id="colorlib-footer" role="contentinfo">
// 			<div class="container">
// 				<div class="row row-pb-md">
// 					<div class="col footer-col colorlib-widget">
// 						<h4>About Footwear</h4>
// 						<p>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life</p>
// 						<p>
// 							<ul class="colorlib-social-icons">
// 								<li><a href="#"><i class="icon-twitter"></i></a></li>
// 								<li><a href="#"><i class="icon-facebook"></i></a></li>
// 								<li><a href="#"><i class="icon-linkedin"></i></a></li>
// 								<li><a href="#"><i class="icon-dribbble"></i></a></li>
// 							</ul>
// 						</p>
// 					</div>
// 					<div class="col footer-col colorlib-widget">
// 						<h4>Customer Care</h4>
// 						<p>
// 							<ul class="colorlib-footer-links">
// 								<li><a href="#">Contact</a></li>
// 								<li><a href="#">Returns/Exchange</a></li>
// 								<li><a href="#">Gift Voucher</a></li>
// 								<li><a href="#">Wishlist</a></li>
// 								<li><a href="#">Special</a></li>
// 								<li><a href="#">Customer Services</a></li>
// 								<li><a href="#">Site maps</a></li>
// 							</ul>
// 						</p>
// 					</div>
// 					<div class="col footer-col colorlib-widget">
// 						<h4>Information</h4>
// 						<p>
// 							<ul class="colorlib-footer-links">
// 								<li><a href="#">About us</a></li>
// 								<li><a href="#">Delivery Information</a></li>
// 								<li><a href="#">Privacy Policy</a></li>
// 								<li><a href="#">Support</a></li>
// 								<li><a href="#">Order Tracking</a></li>
// 							</ul>
// 						</p>
// 					</div>

// 					<div class="col footer-col">
// 						<h4>News</h4>
// 						<ul class="colorlib-footer-links">
// 							<li><a href="blog.html">Blog</a></li>
// 							<li><a href="#">Press</a></li>
// 							<li><a href="#">Exhibitions</a></li>
// 						</ul>
// 					</div>

// 					<div class="col footer-col">
// 						<h4>Contact Information</h4>
// 						<ul class="colorlib-footer-links">
// 							<li>291 South 21th Street, <br> Suite 721 New York NY 10016</li>
// 							<li><a href="tel://1234567920">+ 1235 2355 98</a></li>
// 							<li><a href="mailto:info@yoursite.com">info@yoursite.com</a></li>
// 							<li><a href="#">yoursite.com</a></li>
// 						</ul>
// 					</div>
// 				</div>
// 			</div>
// 			<div class="copy">
// 				<div class="row">
// 					<div class="col-sm-12 text-center">
// 						<p>
// 							<span><!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
// Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i class="icon-heart" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a>
// <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. --></span> 
// 							<span class="block">Demo Images: <a href="http://unsplash.co/" target="_blank">Unsplash</a> , <a href="http://pexels.com/" target="_blank">Pexels.com</a></span>
// 						</p>
// 					</div>
// 				</div>
// 			</div>
// 		</footer>
// 	</div>

// 	<div class="gototop js-top">
// 		<a href="#" class="js-gotop"><i class="ion-ios-arrow-up"></i></a>
// 	</div>
	
// 	<!-- jQuery -->
// 	<script src="/user/js/jquery.min.js"></script>
//    <!-- popper -->
//    <script src="/user/js/popper.min.js"></script>
//    <!-- bootstrap 4.1 -->
//    <script src="/user/js/bootstrap.min.js"></script>
//    <!-- jQuery easing -->
//    <script src="/user/js/jquery.easing.1.3.js"></script>
// 	<!-- Waypoints -->
// 	<script src="/user/js/jquery.waypoints.min.js"></script>
// 	<!-- Flexslider -->
// 	<script src="/user/js/jquery.flexslider-min.js"></script>
// 	<!-- Owl carousel -->
// 	<script src="/user/js/owl.carousel.min.js"></script>
// 	<!-- Magnific Popup -->
// 	<script src="/user/js/jquery.magnific-popup.min.js"></script>
// 	<script src="/user/js/magnific-popup-options.js"></script>
// 	<!-- Date Picker -->
// 	<script src="/user/js/bootstrap-datepicker.js"></script>
// 	<!-- Stellar Parallax -->
// 	<script src="/user/js/jquery.stellar.min.js"></script>
// 	<!-- Main -->
// 	<script src="/user/js/main.js"></script>

// 	</body>
// </html>




module.exports ={
    getAddProducts,
    postproducts,
    productedit,
    posteditproducts,
    removeimage


}
