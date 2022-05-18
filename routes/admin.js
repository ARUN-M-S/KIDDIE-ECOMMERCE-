var express = require("express");
var router = express.Router();
var session = require("express-session");
const adminHelper = require("../helpers/admin-helper");
const productHelper = require("../helpers/product-helper");
var nodemailer = require('nodemailer');


  const { promisify } = require('util');
  
  


// file system
const fs = require("fs");
const { response, json } = require("express");
const { getMaxListeners } = require("process");
var readFile = promisify(fs.readFile);

const adminData = {
  email: "arun@gmail.com",
  pass:"123456" ,
};
/* GET admin dashboard. */
router.get("/", verifyLogin,async function (req, res, next) {
  
    
  let totalRevenue = await adminHelper.getRevenue()
  let deliveredOrders = await adminHelper.getDeliveredOrders()
  let totalProducts = await adminHelper.getTotalProducts()
  let totalUsers = await adminHelper.getTotalUsers()

  let topSelling = await adminHelper.getTopSelling()
  let stockOut = await adminHelper.getStockOut()


  if(totalRevenue==undefined){
    totalRevenue = 0
  }

  

  res.render("admin/admin-dashboard", {
    title: "Admin",
    admin: true,
    header: "ADMIN DASHBOARD",
    totalRevenue,
    deliveredOrders,
    totalProducts,
    totalUsers,
    topSelling,
    stockOut
  });
});


router.get('/getChartDates',async(req,res)=>{
  console.log("chartDatas");
  
  let subCatSales = await adminHelper.getsubCatSales()
  let catSales = await adminHelper.getCatSales()

  let categoryAmount = []
  let category = []
  let catSaleAmount = []
  let categoryName = []
  
  

 

  catSales.map(cat=>{
    category.push(cat._id)
    categoryAmount.push(cat.totalAmount)
  })
  
  // mapping category name and category amount
  subCatSales.map(cat=>{
    categoryName.push(cat._id)
    catSaleAmount.push(cat.totalAmount)
  })



  res.json({categoryName,catSaleAmount,category,categoryAmount})
})


function verifyLogin(req, res, next) {
  if (req.session?.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

/* GET admin login page. */
router.get("/login", function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", {
      title: "Admin",
      admin: true,
      noSidebar: true,
      loginErr: req.session.adminLoginErr,
    });
  }
  req.session.adminLoginErr = false;
});

// post admin credentials
router.post("/login", function (req, res, next) {
  if (
    adminData.email === req.body?.email &&
    adminData.pass === req.body?.pass
  ) {
    req.session.adminLoggedIn = true;
    res.redirect("/admin");
  } else {
    req.session.adminLoginErr = "Invalid Username or Password";
    res.redirect("/admin/login");
  }
});

// logout admin
router.get("/logout", function (req, res, next) {
  req.session.adminLoggedIn = false;
  res.redirect("/admin/login");
});

// category management
var catMsg;
router.get("/category", verifyLogin, function (req, res, next) {
  
  adminHelper.getCategory().then((allCategory) => {
    res.render("admin/category", {
      admin: true,
      header: "CATEGORY MANAGEMENT",
      catMsg,
      subCatMsg,
      allCategory,
    });
    catMsg = null;
    subCatMsg = null;
  });
});

// add category
router.post("/addCategory", verifyLogin, function (req, res, next) {
  adminHelper.addCategory(req.body).then((response) => {
    catMsg = response;
    res.redirect("/admin/category");
  });
});

// add subcategory
var subCatMsg;
router.post("/addSubcategory", verifyLogin, function (req, res, next) {
  adminHelper.addCategory(req.body).then((response) => {
    subCatMsg = response;
    res.redirect("/admin/category");
  });
});

// delete subcategory with or without its products
router.post("/delete-subcategory", verifyLogin, function (req, res, next) {
  if (req.body.isPro === "yes" && req.body.item === "sub") {
    productHelper.deleteProAndSubcat(req.body).then((response) => {
      if (response) {
        // To delete subcategory and each products
        let prod = response.allProducts;
        for (i = 0; i < prod.length; i++) {
          for (let j = 1; j <= 4; j++) {
            fs.unlink(
              `./public/images/product-images/${prod[i]._id}_${j}.webp`,
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                }
              }
            );
          }
        }
      }
    });
  }
  if (req.body.isPro === "no" && req.body.item === "sub") {
    productHelper.deleteProAndSubcat(req.body).then((response) => {
    });
  }
  res.json({ status: true });
});

// delete category with or without its products
router.post("/delete-category", verifyLogin, function (req, res, next) {
  if (req.body.isPro === "yes" && req.body.item === "cat") {
    productHelper.deleteProAndCat(req.body).then((response) => {
      if (response) {
        // To delete subcategory and each products
        let prod = response.allProducts;
        for (i = 0; i < prod.length; i++) {
          for (let j = 1; j <= 4; j++) {
            fs.unlink(
              `./public/images/product-images/${prod[i]._id}_${j}.webp`,
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                }
              }
            );
          }
        }
      }
    });
    res.json({ status: true });
  }
  if (req.body.isPro === "no" && req.body.item === "cat") {
    productHelper.deleteProAndCat(req.body).then((response) => {
    });

    res.json({ status: true });
  }
});

// Brand management
var brandMsg;
router.get("/brand", verifyLogin, function (req, res, next) {
  
  adminHelper.getBrand().then((allBrand) => {
    res.render("admin/brand-manage", {
      admin: true,
      header: "BRAND MANAGEMENT",
      brandMsg,
      allBrand,
    });
    brandMsg = null;
  });
});

// add Brand
router.post("/addBrand", verifyLogin, function (req, res, next) {
  adminHelper.addBrand(req.body).then((response) => {
    brandMsg = response;
    if (brandMsg.status && brandMsg.result) {
      let brandLogo = req.files.brandLogo;
      let id = response.result.insertedId;
      brandLogo.mv("./public/images/brand-logo/" + id + ".png", (err, done) => {
        if (!err) {
          res.redirect("/admin/brand");
        } else {
          res.redirect("/admin/brand");
        }
      });
    } else {
      res.redirect("/admin/brand");
    }
  });
});

// delete brand with or without products
router.post("/delete-brand/", verifyLogin, function (req, res, next) {
  if (req.body.isPro === "yes" && req.body.isBrand === "yes") {
    productHelper.deleteBrand(req.body).then((response) => {
      if (response) {
        // To delete Brand and each products
        let prod = response.allProducts;
        for (i = 0; i < prod.length; i++) {
          for (let j = 1; j <= 4; j++) {
            fs.unlink(
              `./public/images/product-images/${prod[i]._id}_${j}.webp`,
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                }
              }
            );
          }
        }
        fs.unlink(
          "./public/images/brand-logo/" + response.getBrandId._id + ".png",
          (err) => {
            if (err) {
              console.log(err);
            } else {
            }
          }
        );
      }
    });
    res.json({ status: true });
  } else if (req.body.isPro === "no" && req.body.isBrand === "yes") {

    productHelper.deleteBrand(req.body).then((response) => {
      fs.unlink(
        "./public/images/brand-logo/" + response.getBrandId._id + ".png",
        (err) => {
          if (err) {
            console.log(err);
          } else {
          }
        }
      );
    });

    res.json({ status: true });
  }
});

// get Add product page
router.get("/add-product", verifyLogin, function (req, res, next) {
  adminHelper.getCategory().then((allCategory) => {
    if (allCategory) {
      adminHelper.getBrand().then((allBrand) => {
        if (allBrand) {
          res.render("admin/add-product", {
            title: "Add Product",
            admin: true,
            header: "PRODUCT MANAGEMENT",
            allCategory,
            allBrand,
            productAddMsg,
            
          });
          productAddMsg = null;
        }
      });
    } else {
    }
  });
});

// add Product
var productAddMsg;
router.post("/add-product", verifyLogin, function (req, res, next) {
  req.body.productQuantity = parseInt(req.body.productQuantity);
  req.body.landingCost = parseInt(req.body.landingCost);
  req.body.productPrice = parseInt(req.body.productPrice);
  productHelper.addProduct(req.body).then((response) => {
    if (response) {
      productAddMsg = response;
      if (response.status) {
        let prodImg1 = req.files?.product_Image_1;
        let prodImg2 = req.files?.product_Image_2;
        let prodImg3 = req.files?.product_Image_3;
        let prodImg4 = req.files?.product_Image_4;
        let variantId = response.variantid;
        let proid = response.result.insertedId;

        const path = `./public/images/product-images/${proid}`;

        fs.mkdir(path, (err) => {
          if (err) {
            throw err;
          }
        });

        // Moving Image 1
        prodImg1.mv(
          `./public/images/product-images/${proid}/${variantId}_1.webp`,
          (err, done) => {
            if (!err) {
              // Moving Image 2
              prodImg2.mv(
                `./public/images/product-images/${proid}/${variantId}_2.webp`,
                (err, done) => {
                  if (!err) {
                    // Moving Image 3
                    prodImg3.mv(
                      `./public/images/product-images/${proid}/${variantId}_3.webp`,
                      (err, done) => {
                        if (!err) {
                          // Moving Image 4
                          prodImg4.mv(
                            `./public/images/product-images/${proid}/${variantId}_4.webp`,
                            (err, done) => {
                              if (!err) {
                                productAddMsg.status = true;
                                res.redirect("/admin/add-product");
                              }
                            }
                          );
                        } else {
                          productAddMsg.status = false;
                          productAddMsg.imageErr = "Image Upload Failed";
                          res.redirect("/admin/add-product");
                        }
                      }
                    );
                  } else {
                    productAddMsg.status = false;
                    productAddMsg.imageErr = "Image Upload Failed";
                    res.redirect("/admin/add-product");
                  }
                }
              );
            } else {
              productAddMsg.status = false;
              productAddMsg.imageErr = "Image Upload Failed";
              res.redirect("/admin/add-product");
            }
          }
        );
      } else {
        res.redirect("/admin/add-product");
      }
    } else {
      res.redirect("/admin/add-product");
    }
  });
});

// find subcategory
router.get("/find-subcategory", verifyLogin, function (req, res, next) {
  
  productHelper.getSubcategory(req.query).then((response) => {
    res.send(response);
  });
});

// View products
router.get("/view-product", verifyLogin, function (req, res, next) {
 
  productHelper.getAllProducts().then((response) => {
    if (response) {
      res.render("admin/view-products", {
        title: "View Product",
        admin: true,
        header: "PRODUCT MANAGEMENT",
        productEditMsg,
        allProducts: response,
      });
    } else {
    }
    productEditMsg = null;
  });
});

// delete product
router.post("/delete-product", verifyLogin, function (req, res, next) {
  productHelper.getOneProduct(req.body.id).then((result) => {
    productHelper.deleteProduct(req.body.id).then((response) => {
      if (response) {
        const path = `./public/images/product-images/${req.body.id}`;
        // To delete whole  product image folder

        try {
          fs.rmdirSync(path, { recursive: true });

        } catch (err) {
        }
        res.redirect("/admin/view-product");
      } else {
        res.redirect("/admin/view-product");
      }
    });
  });
});

// get edit product page
var productEditMsg;
router.get("/edit-product/", verifyLogin, function (req, res, next) {
  
  productHelper.getOneProduct(req.query.id).then((result) => {
    if (result) {
      adminHelper.getBrand().then((allBrand) => {
        if (allBrand) {
          adminHelper.getCategory().then((allCategory) => {
            res.render("admin/edit-product", {
              title: "Edit Product",
              admin: true,
              header: "PRODUCT MANAGEMENT",
              productEditMsg,
              allCategory,
              allBrand,
              result,
              
            });
          });
        }
      });
    } else {
      res.redirect("/admin/view-product");
    }
  });
});

// post editted product
router.post("/edit-product/", verifyLogin, function (req, res, next) {
  productHelper.getOneProduct(req.query.id).then((result) => {
    let prodImg1 = req.files?.product_Image_1;
    let prodImg2 = req.files?.product_Image_2;
    let prodImg3 = req.files?.product_Image_3;
    let prodImg4 = req.files?.product_Image_4;
    let prodId = req.query.id;
    let varId = req.query.varId;

    if (prodImg1) {
      fs.unlink(
        `./public/images/product-images/${prodId}/${varId}_1.webp`,
        (err, done) => {
          if (!err) {
            prodImg1.mv(
              `./public/images/product-images/${prodId}/${varId}_1.webp`,
              (err, done) => {
              }
            );
          } else {
          }
        }
      );
    }
    if (prodImg2) {
      fs.unlink(
        `./public/images/product-images/${prodId}/${varId}_2.webp`,
        (err, done) => {
          if (!err) {
            prodImg2.mv(
              `./public/images/product-images/${prodId}/${varId}_2.webp`,
              (err, done) => {
              }
            );
          } else {
          }
        }
      );
    }
    if (prodImg3) {
      fs.unlink(
        `./public/images/product-images/${prodId}/${varId}_3.webp`,
        (err, done) => {
          if (!err) {
            prodImg3.mv(
              `./public/images/product-images/${prodId}/${varId}_3.webp`,
              (err, done) => {
              }
            );
          } else {
          }
        }
      );
    }
    if (prodImg4) {
      fs.unlink(
        `./public/images/product-images/${prodId}/${varId}_4.webp`,
        (err, done) => {
          if (!err) {
            prodImg4.mv(
              `./public/images/product-images/${prodId}/${varId}_4.webp`,
              (err, done) => {
              }
            );
          } else {
          }
        }
      );
    }
  });

  productHelper.updateProduct(req.query, req.body).then((result) => {
    if (result) {
      productEditMsg = result;
      res.redirect("/admin/view-product");
    }
  });
});


// Get view user page
router.get("/view-users", verifyLogin, (req, res, next) => {
 
  adminHelper.getUsers().then((response) => {
    if (response) {
      res.render("admin/view-users", {
        title: "View Users",
        admin: true,
        header: "USER MANAGEMENT",
        allUsers: response,
      });
    }
  });
});

// block user
router.post("/block-user", verifyLogin, (req, res) => {
  adminHelper.blockUser(req.body.id).then((resp) => {
    if (response) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  });
});

// unblock user
router.post("/unblock-user", verifyLogin, (req, res) => {
  adminHelper.unblockUser(req.body.id).then((resp) => {
    if (response) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  });
});

// Get blocked users list page
router.get("/blocked-users", verifyLogin, (req, res, next) => {
  
  adminHelper.getBlockedUsers().then((response) => {
    if (response) {
      res.render("admin/blocked-users", {
        title: "blocked Users",
        admin: true,
        header: "USER MANAGEMENT",
        blockedUsers: response,
      });
    }
  });
});

// BANNER MANAGEMENT
router.get("/manage-banner", verifyLogin, async (req, res, next) => {
  
  let allBanner = await adminHelper.getBanner();
  res.render("admin/manage-banner", {
    title: "Banner Management",
    admin: true,
    header: "BANNER MANAGEMENT",
    allBanner,
  });
});

// post editted product
router.post("/manage-banner/", verifyLogin, function (req, res, next) {
  let topBannerImg1 = req.files?.top_banner_image_1;
  let topBannerImg2 = req.files?.top_banner_image_2;
  let topBannerImg3 = req.files?.top_banner_image_3;
  let offerImg = req.files?.offer_banner_image_1;


  if (topBannerImg1) {
    topBannerImg1.mv(
      `./public/images/banner-images/topBanner1.webp`,
      (err, done) => {
      }
    );
  }
  if (topBannerImg2) {
    topBannerImg2.mv(
      `./public/images/banner-images/topBanner2.webp`,
      (err, done) => {
      }
    );
  }
  if (topBannerImg3) {
    topBannerImg3.mv(
      `./public/images/banner-images/topBanner3.webp`,
      (err, done) => {
      }
    );
  }
  if (offerImg) {
    offerImg.mv(
      `./public/images/banner-images/offerBanner.webp`,
      (err, done) => {
      }
    );
  }

  adminHelper.addBanner(req.body).then((result) => {
    if (result) {
      productEditMsg = result;
      res.redirect("/admin/manage-banner");
    }
  });
});

// Get order management page
router.get("/manage-orders", verifyLogin, (req, res, next) => {
  
  adminHelper.viewOrders().then((response) => {
    if (response) {
      res.render("admin/order-management", {
        title: "Order Management",
        admin: true,
        header: "ORDER MANAGEMENT",
        allOrders: response,
      });
    }
  });
});

router.post("/status-update", verifyLogin,async (req, res) => {
  let status = req.body.status;
  let orderId = req.body.orderId;
  let proId = req.body.proId;
  console.log(orderId,"userMail is Here line 694 in admin.js");
  
  let userEmail= await adminHelper.userEmail(orderId);
 
  console.log(userEmail,"admin.js704");
  adminHelper.deliveryStatusUpdate(status, orderId, proId).then((resp) => {
    if (response) {
      res.json({ status: true });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
         user: 'arunmsudevan@gmail.com',
         pass: 'MACBOOKm123456789'
        }
       });
       
           transporter.sendMail({
             
             from:"sajeevpraveen2@gmail.com",
             to: userEmail[0].deliveryDetails.email,
             subject:"Kiddie",
         html:`<!DOCTYPE html>
         <html>
         
         <head>
         
           <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
           <meta name="viewport" content="width=device-width, initial-scale=1">
           <meta http-equiv="X-UA-Compatible" content="IE=edge" />
           <style type="text/css">
             /* CLIENT-SPECIFIC STYLES */
             body,
             table,
             td,
             a {
               -webkit-text-size-adjust: 100%;
               -ms-text-size-adjust: 100%;
             }
         
             table,
             td {
               mso-table-lspace: 0pt;
               mso-table-rspace: 0pt;
             }
         
             img {
               -ms-interpolation-mode: bicubic;
             }
         
             /* RESET STYLES */
             img {
               border: 0;
               height: auto;
               line-height: 100%;
               outline: none;
               text-decoration: none;
             }
         
             table {
               border-collapse: collapse !important;
             }
         
             body {
               height: 100% !important;
               margin: 0 !important;
               padding: 0 !important;
               width: 100% !important;
             }
         
             /* iOS BLUE LINKS */
             a[x-apple-data-detectors] {
               color: inherit !important;
               text-decoration: none !important;
               font-size: inherit !important;
               font-family: inherit !important;
               font-weight: inherit !important;
               line-height: inherit !important;
             }
         
             /* MEDIA QUERIES */
             @media screen and (max-width: 480px) {
               .mobile-hide {
                 display: none !important;
               }
         
               .mobile-center {
                 text-align: center !important;
               }
         
               .align-center {
                 max-width: initial !important;
               }
         
               h1 {
                 display: inline-block;
                 margin-right: auto !important;
                 margin-left: auto !important;
               }
             }
         
             @media screen and (min-width: 480px) {
               .mw-50 {
                 max-width: 50%;
               }
             }
         
             /* ANDROID CENTER FIX */
             div[style*="margin: 16px 0;"] {
               margin: 0 !important;
             }
         
             :root {
               --purple: #5a3aa5;
               --pink: #b91bab;
               --blue: #2cbaef;
               --green: #23c467;
             }
           </style>
         </head>
         
         <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
         
           <!-- HIDDEN PREHEADER TEXT -->
           <div
             style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            MESSAGE FROM KIDDIE!
           </div>
         
           <table border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr>
               <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
         
                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;">
                   <tr>
                     <td align="center" height="6"
                       style="background-image: linear-gradient(to right, #b91bAb, #5a3aa5); background-color: #b91bAb;"
                       bgcolor="#b91bAb"></td>
                   </tr>
                 </table>
                 <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:800px;">
                   <tr>
                     <td align="center" valign="top" style="background-color: #ffffff; font-size:0; padding: 35px 35px 0;"
                       bgcolor="#ffffff">
         
                       <div style=" text-align: center; max-width:50%;  vertical-align:top; width:100%;">
                         <table class="align-center" border="0" cellpadding="0" cellspacing="0" width="100%"
                           style="max-width:800px;">
                           <tr>
                             <td align="left" height="48" valign="center"
                               style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size:48px; font-weight: 800; line-height: 48px;"
                               class="mobile-center">
                               <div class="text-center">
                                 <span style="color: #ff9500;">K <span style="color: #000;">IDDIE</span> </span>
                               </div>
                             </td>
                           </tr>
                         </table>
                       </div>
         
                     </td>
                   </tr>
                   <tr>
                     <td align="center" style="padding: 0 15px 20px 15px; background-color: #ffffff;" bgcolor="#ffffff">
         
                       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                         <tr>
                           <td align="center"
                             style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                             <img src="http://healthplang.com/App_Themes/GHP/images/icon-check-mark.png" width="125" height="120"
                               style="display: block; border: 0px;" /><br>
                             <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                               Hey ${userEmail[0].deliveryDetails.name},Your order has been ${userEmail[0].products[0].status} Thank You For Your Order!
                             </h2>
                           </td>
                         </tr>
                         <tr>
                           <td align="center"
                             style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                             <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777; padding: 0 30px;">
         
         
                              
                               Please keep in touch!
         
                              
                             </p>
                           </td>
                         </tr>
         
         
                   </tr>
                 </table>
         
               </td>
             </tr>
             `
         
             
            
                 
           
           });
         
      
       
}else{
  res.json({status:false})
}
})})

router.get("/ordered-products", verifyLogin, (req, res, next) => {
  
  let orderId = req.query.orderId;
  let userId = req.query.userId;
  let proId = req.query.proId;
  productHelper.getOrderProducts(orderId, userId, proId).then((products) => {

    res.render("admin/ordered-products", {
      products,
      title: "Ordered Products",
      admin: true,
      header: "ORDER MANAGEMENT",
    });
  });
});


// Get product offer management page
router.get("/product-offer", verifyLogin,async (req, res, next) => {
  
  let offerList = await productHelper.getProductOffer()
  let allProducts = await productHelper.getAllProducts()

  res.render("admin/product-offer", {
    title: "Offer Management",
    admin: true,
    header: "OFFER MANAGEMENT",
    offerList,
    allProducts
  });
});


// Post product offer management page
router.post("/product-offer", verifyLogin, (req, res, next) => {
  productHelper.addProductOffer(req.body).then((resp)=>{
    res.redirect('/admin/product-offer')
  })
});

// delete product offer
router.post("/delete-product-offer", verifyLogin,async (req, res, next) => {
  let proId = req.body.proId
  let offerProId = req.body.offerId
  await productHelper.deleteProductOffer(proId,offerProId)
  res.json({status:true})
});

// Get category offer management page
router.get("/category-offer", verifyLogin,async (req, res, next) => {
 
  let allCategory = await adminHelper.getCategory()
  let offerList = await productHelper.getCategoryOffer()
  res.render("admin/category-offer", {
    title: "Offer Management",
    admin: true,
    header: "OFFER MANAGEMENT",
    allCategory,
    offerList
  });
});

// post category offer management page
router.post("/category-offer", verifyLogin,async (req, res, next) => {
  productHelper.addCategoryOffer(req.body).then((resp)=>{
    res.redirect('/admin/category-offer')
  })
});

// delete category offer
router.post("/delete-category-offer", verifyLogin,async (req, res, next) => {
  productHelper.deleteCategoryOffer(req.body.catName,req.body.offerId).then((resp)=>{
    res.redirect('/admin/category-offer')
  })
});

// Get coupon offer management page
router.get("/coupon-offer", verifyLogin,async (req, res, next) => {
  
  let couponList = await productHelper.getCouponOffer()
  res.render("admin/coupon-offer", {
    title: "Coupon Management",
    admin: true,
    header: "COUPON MANAGEMENT",
    couponList,
    couponMsg
  });
  couponMsg = null
});


// post coupon offer management page
var couponMsg
router.post("/coupon-offer", verifyLogin,async (req, res, next) => {
  await productHelper.addCouponOffer(req.body).then((resp)=>{
    if(resp.couponExists){
      couponMsg = "This Coupon Already Exists"
    }
    else{
      couponMsg = "Coupon Added Successfully"
    }
    res.redirect('/admin/coupon-offer')
  })
});

// delete coupon offer
router.post("/delete-coupon", verifyLogin,async (req, res, next) => {
  productHelper.deleteCoupon(req.body.couponId).then((resp)=>{
    res.redirect('/admin/category-offer')
  })
});

// Get sales report
router.get("/sales-report", verifyLogin,async (req, res, next) => {
  
  let fromDate = new Date(req.query.fromDate)
  let tillDate = new Date(req.query.tillDate)
  let salesReport = await productHelper.getSalesReport(fromDate,tillDate)
  res.render("admin/sales-report", {
    title: "Sales Report",
    admin: true,
    header: "SALES REPORT",
    salesReport
  });
});

// Get stock report
router.get("/stock-report", verifyLogin,async (req, res, next) => {
  
  let stockReport = await productHelper.getStockReport()
  res.render("admin/stock-report", {
    title: "STOCK Report",
    admin: true,
    header: "STOCK REPORT",
    stockReport,
    
  });
});


// Get user report
router.get("/user-report", verifyLogin,async (req, res, next) => {

  
  
  let userReport = await adminHelper.getUserReport()

  res.render("admin/user-report", {
    title: "User Report",
    admin: true,
    header: "USER REPORT",
    userReport
  });
});
// ============================Add Curosel==============
router.post("/add-curosel", (req, res) => {
  productHelper.addCarousel(req.body).then((id) => {
    let CarouselImage = req.files.image;
    CarouselImage.mv("./public/Carousel/" + id + ".jpg", (err, done) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/add-category", { admin: true });
      }
    });
    res.render("admin/add-category");
  });
});
router.get("/sales-charts", verifyLogin,async (req, res, next) => {

  
  
  res.render("admin/sales-charts",{admin:true})
});

// ====================================salesChart===================
router.get('/getChartDatess', verifyLogin, async(req,res)=>{
  console.log("arunms");
  let dailySales = await adminHelper.getdailySales();
  let catSales = await adminHelper.getCatSales();
  let monthlySale = await adminHelper.getMonthlySales();
  let yearlySale = await adminHelper.getYearlySales();

  let yearlyAmt = []
  let year = []
  let montlyAmt = []
  let months = []
  let dailyAmt = []
  let daysOfWeek = []
  let catSaleAmount = []
  let categoryName = []
  
  


   // mapping yearlysales amount
   yearlySale.map(daily=>{
    yearlyAmt.push(daily.totalAmount)
  })


  // mapping yearlysales dates
  yearlySale.map(daily=>{
    year.push(daily._id) //Array of days in a week
  })

  // mapping daily sales amount
  dailySales.map(daily=>{
    dailyAmt.push(daily.totalAmount)
  })


  // mapping daily sales dates
  dailySales.map(daily=>{
    daysOfWeek.push(daily._id) //Array of days in a week
  })

   // mapping montly sales amount
 monthlySale.map(daily=>{
  montlyAmt.push(daily.totalAmount)
})


// mapping montly sales dates
monthlySale.map(daily=>{
  months.push(daily._id) //Array of days in a week
})
console.log(months,"dailySaless");
  // mapping category name and category amount
  catSales.map(cat=>{
    categoryName.push(cat._id)
    catSaleAmount.push(cat.totalAmount)
  })

console.log(dailyAmt,"daily amount");

  res.json({daysOfWeek,dailyAmt,categoryName,catSaleAmount,montlyAmt, months,yearlyAmt,year})
})
// =================================ORDER CONFIRMATION======================
router.get("/orderAlert",async(req,res)=>{

  let userOrder = await adminHelper.getOrderDeatils(req.session?.user._id);
  let date = userOrder[0].date.toString()
      
      console.log(date,"order date");
  
  
  var dt = new Date(date);
  dt.setDate( dt.getDate() + 5 );
  newDate=dt.toString();
  
//   var nodemailer = require('nodemailer');
// var fs = require('fs');

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
  user: process.env.SMPT_MAIL,
         pass: process.env.SMPT_PASSWORD
 }
});

fs.readFile('emailStatus.hbs', {encoding: 'utf-8'}, (err, data)=>{
  
 
 

  if(err){
    console.warn("Error getting password reset template: " + err);
  }else{
    transporter.sendMail({
      
      from:"sajeevpraveen2@gmail.com",
      to: userOrder[0].deliveryDetails.email,
      subject:"Kiddie",
  
  html:`<!DOCTYPE html>
  <html>
  
  <head>
  
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
      /* CLIENT-SPECIFIC STYLES */
      body,
      table,
      td,
      a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
  
      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      img {
        -ms-interpolation-mode: bicubic;
      }
  
      /* RESET STYLES */
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
  
      table {
        border-collapse: collapse !important;
      }
  
      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
  
      /* iOS BLUE LINKS */
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
  
      /* MEDIA QUERIES */
      @media screen and (max-width: 480px) {
        .mobile-hide {
          display: none !important;
        }
  
        .mobile-center {
          text-align: center !important;
        }
  
        .align-center {
          max-width: initial !important;
        }
  
        h1 {
          display: inline-block;
          margin-right: auto !important;
          margin-left: auto !important;
        }
      }
  
      @media screen and (min-width: 480px) {
        .mw-50 {
          max-width: 50%;
        }
      }
  
      /* ANDROID CENTER FIX */
      div[style*="margin: 16px 0;"] {
        margin: 0 !important;
      }
  
      :root {
        --purple: #5a3aa5;
        --pink: #b91bab;
        --blue: #2cbaef;
        --green: #23c467;
      }
    </style>
  </head>
  
  <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
  
    <!-- HIDDEN PREHEADER TEXT -->
    <div
      style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
     MESSAGE FROM KIDDIE!
    </div>
  
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
  
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;">
            <tr>
              <td align="center" height="6"
                style="background-image: linear-gradient(to right, #b91bAb, #5a3aa5); background-color: #b91bAb;"
                bgcolor="#b91bAb"></td>
            </tr>
          </table>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:800px;">
            <tr>
              <td align="center" valign="top" style="background-color: #ffffff; font-size:0; padding: 35px 35px 0;"
                bgcolor="#ffffff">
  
                <div style=" text-align: center; max-width:50%;  vertical-align:top; width:100%;">
                  <table class="align-center" border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width:800px;">
                    <tr>
                      <td align="left" height="48" valign="center"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size:48px; font-weight: 800; line-height: 48px;"
                        class="mobile-center">
                        <div class="text-center">
                          <span style="color: #ff9500;">K <span style="color: #000;">IDDIE</span> </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
  
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 15px 20px 15px; background-color: #ffffff;" bgcolor="#ffffff">
  
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                  <tr>
                    <td align="center"
                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                      <img src="http://healthplang.com/App_Themes/GHP/images/icon-check-mark.png" width="125" height="120"
                        style="display: block; border: 0px;" /><br>
                      <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                        Hey ${userOrder[0].deliveryDetails.name},Thank You For Your Order!
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td align="center"
                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                      <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777; padding: 0 30px;">
  
  
                        We're happy to let you know that your order has been ready to ship!
                        Please keep in touch!
  
                       
                      </p>
                    </td>
                  </tr>
  
  
            </tr>
          </table>
  
        </td>
      </tr>
      <tr>
        <td align="center" height="100%" valign="top" width="100%"
          style="padding: 0 15px 5px 15px; background-color: #ffffff;" bgcolor="#ffffff">
  
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
            <tr>
              <td align="center" valign="top" style="font-size:0;">
  
                <div class="mw-50" style="display:inline-block; padding-bottom: 15px; vertical-align:top; width:100%;">
  
                  <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                      <td align="left" valign="top"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 0 10px;">
                        <p style="font-weight: 800;">Delivery Address</p>
                        <p>${userOrder[0].deliveryDetails.houseNumber}  ${userOrder[0].deliveryDetails.streetAddress}<br>${userOrder[0].deliveryDetails.pincode}, ${userOrder[0].deliveryDetails.locality},${userOrder[0].deliveryDetails.district}, ${userOrder[0].deliveryDetails.state}</p>
                      </td>
                    </tr>
                  </table>
                </div>
  
                <div class="mw-50" style="display:inline-block; padding-bottom: 15px; vertical-align:top; width:100%;">
                  <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                    <tr>
                      <td align="left" valign="top"
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 0 10px;">
                        <p style="font-weight: 800;">Estimated Delivery Date</p>
                        <p>${newDate}</p>
                      </td>
                    </tr>
                  </table>
                </div>
  
              </td>
            </tr>
          </table>
  
        </td>
      </tr>
  
      <tr>
        <td align="center" style=" padding: 35px; background-color: #000000cb;" bgcolor="#b91bAb">
  
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:1000px;">
            <tr>
              <td align="center"
                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                <h2 style="font-size: 24px; font-weight: 800; line-height: 30px; color: #ffffff; margin: 0;">
                  Get 25% off your next order.
                </h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 25px 0 15px 0;">
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius: 45px;" bgcolor="#66b3b7">
                      <a href="#" target="_blank"
                        style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; text-decoration: none; border-radius: 45px; background-color: #5a3aa5; padding: 20px 40px 25px; border: none; display: block;">Start
                        Shopping</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
  
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 35px 35px 15px; background-color: #ffffff;" bgcolor="#ffffff">
  
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
  
            <tr>
              <td align="center"
                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;">
                <p
                  style="font-size: 14px; font-weight: 400; line-height: 20px; color: #666666; padding: 0 25px; max-width: 400px;">
                  If you didn't create an account using this email address, please ignore this email or <a
                    href="http://healthplang.com/specialpages/emailunsubscribe.aspx/" target="_blank"
                    style="color: #000000;">unsusbscribe</a>.
                  <span
                    style="color: #888888; display: block; font-size: 90%; font-weight: 600; padding-top: 15px;">&copy;
                    2022 KIDDIE. All rights reserved.</span>
                </p>
              </td>
            </tr>
          </table>
  
        </td>
      </tr>
    </table>
  
    </td>
    </tr>
    </table>
  
  </body>
  
  </html>`,
      
     
          
    
    });
  }
});



});


module.exports = router;
