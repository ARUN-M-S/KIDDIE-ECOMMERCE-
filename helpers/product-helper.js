var db = require("../config/connection");
var collections = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { Collection } = require("mongodb");

module.exports = {
     // Add product to Database
  addProduct: (productData) => {
    productData.productQuantity = parseInt(productData.productQuantity);
    productData.landingCost = parseInt(productData.landingCost);
    productData.productPrice = parseInt(productData.productPrice);
    let today = Date(Date.now());
      let date = today.toString();
    console.log(productData);
    return new Promise(async (resolve, reject) => {
      let variantid = new objectId()
      let isProduct = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .findOne({ productName: productData.productName }); //finds for a document in db of product name of req.body
      if (isProduct) {

          //if same product is in product array shows error
          resolve({ status: false, msg: "This Product Already Exist" });
      } else {
        //if there is no document of product name, add product
        await db
          .get()
          .collection(collections.PRODUCT_COLLECTION)
          .insertOne(
            {
              productName:productData.productName,
              productDescription:productData.productDescription,
              productBrand:productData.productBrand,
              productCategory:productData.productCategory,
              productSubcategory:productData.productSubcategory,
              Date:date,

              productVariants: [{
                variantId: variantid,
               
                productQuantity:productData.productQuantity,
               
                productPrice:productData.productPrice,
              }]
            }).then((result)=>{
            resolve({
              result,
              status: true,
              variantid,
              msg: "Product Added Successfully",
            });
          })
      }
    });
  },

   //   get subcategory datas
   getSubcategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let allSubcategory = await db
        .get()
        .collection(collections.PRODUCT_CATEGORY)
        .findOne({category: data.category})
        if(allSubcategory){
          resolve(allSubcategory.subcategory);
        }
        else{
            console.log("Error Getting getSubcategory");
        }
    });
  },

  // Get all products
  getAllProducts:()=>{
    return new Promise(async (resolve,reject)=>{
      let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
      
      resolve(allProducts)
    })
  },
   //====================== Get Top Offer products=============================
   getTopofferProducts:()=>{
    return new Promise(async (resolve,reject)=>{
      let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({productVariants:{$elemMatch:{offer:{$gt:30}}}}).toArray()
     
      resolve(allProducts)
    })
  },
  // =============================================New Arrivels=============================
  getNewArrivels:()=>{
    return new Promise(async (resolve,reject)=>{
      let today = Date(Date.now());
      let date = today.toString();
      console.log(date,"new Date");
      var dt = new Date(date);
      dt.setDate( dt.getDate() - 1 );
      newDate=dt.toString();
      console.log(newDate,"this is my date");
      
      console.log(dt,"new arrivels");
      let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({Date:{$gt:newDate}}).limit(8).toArray()
      console.log(allProducts,"New Products ");
      resolve(allProducts)
    })
  },
  // ======================================New Brands==========================
  getNewBrands:()=>{
    return new Promise(async (resolve,reject)=>{
     
      
      
      let brands = await db.get().collection(collections.BRAND_COLLECTION).find().toArray()
      
      resolve(brands)
    })
  },
  getMyBrandProducts:(brand)=>{
 
     
    return new Promise(async (resolve,reject)=>{
      let brandMyProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({productBrand:brand}).toArray()
      console.log(brandMyProducts,"hhhhhhhhhhhhhhhhhhhh");
      resolve(brandMyProducts)
    })
  },
 

   // ====================================  delete product ===========================
   deleteProduct: (data) => {
    return new Promise(async (resolve, reject) => {
        await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(data) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  // Get one product
    getOneProduct:(data)=>{
    return new Promise(async (resolve,reject)=>{
      let oneProduct = await db.get().collection(collections.PRODUCT_COLLECTION).find({_id: objectId(data)}).toArray()
      resolve(oneProduct)
    })
  },

    // Update products
    updateProduct: (productId,productData) => {

      productData.productQuantity = parseInt(productData.productQuantity);
      productData.landingCost = parseInt(productData.landingCost);
      productData.productPrice = parseInt(productData.productPrice);

      return new Promise(async (resolve, reject) => {
        let isProduct = await db
          .get()
          .collection(collections.PRODUCT_COLLECTION)
          .findOne({ _id: objectId(productId.id) }); //finds for a document in db by product id
        if (isProduct) {

          await db
            .get()
            .collection(collections.PRODUCT_COLLECTION)
            .updateOne({_id: objectId(productId.id)},{
              $set:{
                productName:productData.productName,
                productDescription:productData.productDescription,
                productBrand:productData.productBrand,
                productCategory:productData.productCategory,
                productSubcategory:productData.productSubcategory,
                
              }}).then(async (result)=>{

              
                // await db
                // .get()
                // .collection(collections.PRODUCT_COLLECTION)
                // .updateOne({_id: objectId(productId.id)},{
                //   $push: { productVariants:
                //     {
                //       landingCost:productData.landingCost,
                //       productPrice:productData.productPrice,
                //       productColour:productData.productColour,
                //       productQuantity:productData.productQuantity,
                //     }
                //   }
                // })

                await db
                .get()
                .collection(collections.PRODUCT_COLLECTION)
                .updateOne({"productVariants.variantId": objectId(productId.varId)},{
                  $set: 
                    {
                      "productVariants.$.landingCost": productData.landingCost,
                      "productVariants.$.productPrice":productData.productPrice,
                      "productVariants.$.productColour":productData.productColour,
                      "productVariants.$.productQuantity":productData.productQuantity,
                    }
                })


              resolve({
                isProduct,
                status: true,
                msg: "Product Updated Successfully",
              });
            })
          } 
          else {
            //if there is no document of product name
            resolve({
              status: false,
              msg: "Product Update Failed",
            });
          
        }
      });
    },
    


    //   delete product and subcategory
    deleteProAndSubcat: (proData) => {
    return new Promise(async (resolve, reject) => {

      let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({productSubcategory: proData.subcategory}).toArray()
      
      if(proData.isPro==="yes"){
         
          let deletePro =  await db
          .get()
          .collection(collections.PRODUCT_COLLECTION)
          .deleteMany({ productSubcategory: proData.subcategory })
          .then((response) => {
          });
        }
        if(proData.item==='sub'){
          let deleteSub = await db
          .get()
          .collection(collections.PRODUCT_CATEGORY)
          .updateOne(
            { category: proData.category },
            { $pull: { subcategory: proData.subcategory } }
            ).then((res)=>{
            })
          }
          resolve({allProducts})
    });
  },

    //   delete product and category
    deleteProAndCat: (proData) => {
    return new Promise(async (resolve, reject) => {

      let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({productCategory: proData.category}).toArray()

      //  To delete with products
      if(proData.isPro==="yes"){
         
          let deletePro =  await db
          .get()
          .collection(collections.PRODUCT_COLLECTION)
          .deleteMany({productCategory: proData.category})
          .then((response) => {
          });
        }
        if(proData.item==='cat'){
          let deleteCat = await db
          .get()
          .collection(collections.PRODUCT_CATEGORY)
          .deleteOne({ category: proData.category })
          .then((res)=>{
            })
          }
          resolve({allProducts})
    });
  },

    //   delete product and brand 
    deleteBrand: (proData) => {
      return new Promise(async (resolve, reject) => {

        let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({productBrand: proData.brandName}).toArray()
        
        let getBrandId =  await db
          .get()
          .collection(collections.BRAND_COLLECTION)
          .findOne({brandName: proData.brandName})

        //  To delete with products
        if(proData.isPro){
          
            let deletePro =  await db
            .get()
            .collection(collections.PRODUCT_COLLECTION)
            .deleteMany({productBrand: proData.brandName})
            .then((response) => {
            });

          }
          if(proData.isBrand){

            let deleteBrand = await db
              .get()
              .collection(collections.BRAND_COLLECTION)
              .deleteOne({ brandName: proData.brandName })
              .then((response) => {
              });
            }
            resolve({allProducts,getBrandId})
      });
    },

    getOrderProducts:(orderId,userId)=>{
      return new Promise(async (resolve,reject)=>{
       let prod = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
            $match:{_id: objectId(orderId)}
          },
          {
            $unwind: "$products"
          },
          {
            $project:{
              item: "$products.item",
              quantity: "$products.quantity",
              subTotal: "$products.subTotal",
              status: "$products.status",
              cancelled: "$products.cancelled"
            }
          },
          {
            $lookup:{
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product"
            }
          },
          {
            $project:{
              item:1,
              quantity:1,
              subTotal:1,
              status:1,
              cancelled:1,
              products: "$product"
            }
          },
          {
            $unwind: "$products"
          },
          // {
          //   $unwind: "$products.productVariants"
          // },
          {
            $project:{
              item:1,
              quantity:1,
              subTotal:1,
              status:1,
              cancelled:1,
              productName: "$products.productName",
              productPrice: {
               $arrayElemAt:["$products.productVariants.productPrice",0]
              }
            }
          }
        ]).toArray()
        resolve(prod)
      })


    },


    addProductOffer:(data)=>{
      return new Promise(async (resolve,reject)=>{
        data.discount = parseInt(data.discount)
        discount = parseInt(data.discount)
        data.startDate = new Date(data.startDate)
        data.expiryDate = new Date(data.expiryDate)

        let offerExist = await db.get().collection(collections.PRODUCT_OFFER).findOne({"data.offerProduct": data.offerProduct})

        if(offerExist){
          await db.get().collection(collections.PRODUCT_OFFER).updateOne({"data.offerProduct": data.offerProduct},{
            $set: {
              "data.discount" : data.discount,
              "data.startDate" : data.startDate,
              "data.expiryDate" : data.expiryDate,
            }
          })
        }
        else{
            await db.get().collection(collections.PRODUCT_OFFER).insertOne({data})
            }

            let products = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
              {
                $match:{productName: data.offerProduct}
              },
              {
                $unwind: "$productVariants"
              }
            ]).toArray()
  
            await products.map(async(product)=>{
              let productPrice = product.productVariants.productPrice
              productPrice = parseInt(productPrice)
              let discountPrice = productPrice-((productPrice*discount)/100)
              discountPrice = parseInt(discountPrice.toFixed(2))
              let variantId = product.productVariants.variantId + ""
              
              await db.get().collection(collections.PRODUCT_COLLECTION).updateOne(
                {
                  _id:product._id,
                  "productVariants.variantId": objectId(variantId)
                },
                {
                  $set:{
                    "productVariants.$[].offerPrice": discountPrice,
                    "productVariants.$[].offer": discount

                  }
                })
            })
            resolve({status:true})
              
      })
    },

    getProductOffer:()=>{
      return new Promise(async(resolve,reject)=>{
        let offerList = await db.get().collection(collections.PRODUCT_OFFER).aggregate([
          {
            $lookup:{
              from: collections.PRODUCT_COLLECTION,
              localField: "data.offerProduct",
              foreignField: "productName",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $project:{
              offerProduct: "$data.offerProduct",
              discount: "$data.discount",
              startDate: "$data.startDate",
              expiryDate: "$data.expiryDate",
              productPrice: {$arrayElemAt: ["$products.productVariants.productPrice",0]},
              offerPrice: {$arrayElemAt: ["$products.productVariants.offerPrice",0]},
              productId: "$products._id"
            }
          }
        ]).toArray()

        resolve(offerList)
      })
    },

    deleteProductOffer:(offerProId,offerId)=>{
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(collections.PRODUCT_COLLECTION).updateOne(
          {
            _id: objectId(offerProId)
          },
          {
            $unset:{
              "productVariants.$[].offerPrice": "",
              "productVariants.$[].offer": ""

            }
          }).then((resp)=>{
            db.get().collection(collections.PRODUCT_OFFER).deleteOne({_id: objectId(offerId)})
          })
        resolve()
      })
    },

    addCategoryOffer:(data)=>{
      return new Promise(async(resolve,reject)=>{
        data.discount = parseInt(data.discount)
        discount = parseInt(data.discount)
        data.startDate = new Date(data.startDate)
        data.expiryDate = new Date(data.expiryDate)

        let offerExist = await db.get().collection(collections.CATEGORY_OFFER).findOne({"data.offerCategory": data.offerCategory})

        if(offerExist){
          await db.get().collection(collections.CATEGORY_OFFER).updateOne({"data.offerCategory": data.offerCategory},{
            $set: {
              "data.discount" : data.discount,
              "data.startDate" : data.startDate,
              "data.expiryDate" : data.expiryDate,
            }
          })
        }
        else{
            await db.get().collection(collections.CATEGORY_OFFER).insertOne({data})
            }

            let products = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
              {
                $match:{
                  productCategory: data.offerCategory}
              },
              {
                $unwind: "$productVariants"
              }
            ]).toArray()

            await products.map(async(product)=>{
              let productPrice = product.productVariants.productPrice
              productPrice = parseInt(productPrice)
              let discountPrice = productPrice-((productPrice*discount)/100)
              discountPrice = parseInt(discountPrice.toFixed(2))
              let variantId = product.productVariants.variantId + ""
              
              await db.get().collection(collections.PRODUCT_COLLECTION).updateOne(
                {
                  _id:product._id,
                  "productVariants.variantId": objectId(variantId)
                },
                {
                  $set:{
                    "productVariants.$[].offerPrice": discountPrice,
                    "productVariants.$[].offer": discount
                  }
                })
            })
            resolve({status:true})    
      })
    },

    getCategoryOffer:()=>{
      return new Promise(async (resolve,reject)=>{
        let offerList = await db.get().collection(collections.CATEGORY_OFFER).find({}).toArray()
        resolve(offerList)
      })
    },

    deleteCategoryOffer:(catName,offerId)=>{
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(collections.PRODUCT_COLLECTION).updateMany(
          {
            "productCategory": catName
          },
          {
            $unset:{
              "productVariants.$[].offerPrice": "",
              "productVariants.$[].offer": ""

            }
          }).then((resp)=>{
            db.get().collection(collections.CATEGORY_OFFER).deleteOne({_id: objectId(offerId)})
          })
        resolve()
      })
    },

    addCouponOffer:(data)=>{
        return new Promise(async (resolve,reject)=>{
          data.discount = parseInt(data.discount)
          discount = parseInt(data.discount)
          data.startDate = new Date(data.startDate)
          data.expiryDate = new Date(data.expiryDate)
          data.couponCode = data.couponCode.toUpperCase()

      

          let couponExist = await db.get().collection(collections.COUPON_OFFER).findOne({"couponCode": data.couponCode})
  
          if(couponExist){
            resolve({couponExists: true})
          }
          else{
              await db.get().collection(collections.COUPON_OFFER).insertOne({
                "couponCode": data.couponCode,
                "discount" : data.discount,
                "startDate" : data.startDate,
                "expiryDate" : data.expiryDate,})

                resolve({status:true})
              }
        })
    },

    getCouponOffer:()=>{
      return new Promise(async (resolve,reject)=>{
        let couponList = await db.get().collection(collections.COUPON_OFFER).find({}).toArray()
       
        resolve(couponList)
      })
    },

    deleteCoupon:(couponId)=>{
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(collections.COUPON_OFFER).deleteOne(
          {
            _id: objectId(couponId)
          })

        resolve()
      })
    },

    checkCouponOffer:(code,userId)=>{
      return new Promise(async(resolve,reject)=>{
      let couponExist = await db.get().collection(collections.COUPON_OFFER).findOne({couponCode: code})
      if(couponExist){

       let isUsed = await db.get().collection(collections.COUPON_OFFER).findOne(
          {
            couponCode:code,
            usedUsers: {
              $elemMatch: {
                userId: objectId(userId)
              }
            }
          })
        if(isUsed){
        
          resolve({isUsed: true})
        }
        else{
          resolve({status:true,couponExist})
        }

      }
      else{
        resolve({status:false})
      }
      })
    },
    
// ==========================================checkingWallet=====================
checkWallet:(cash,userId)=>{
  return new Promise(async(resolve,reject)=>{
  let walletExist = await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId),walletAmount: { $exists: true }})
  if(walletExist.walletAmount>cash>0){
   

      resolve({status: true,cash})
  
  }
  else {
    console.log("amount is here producthelpers.653");

    resolve({status:false})
  }
  })
},


// ==========================================checkingWallet=====================

    checkOfferExpiry:(today)=>{
      return new Promise(async (resolve,reject)=>{

        // CHecking for category offer expiry
        let offerExist = await db.get().collection(collections.CATEGORY_OFFER).find({
          "data.expiryDate": {
            $lte: today
          },
        }).toArray()


        if(offerExist){

          offerExist.map(async(data)=>{
            await db.get().collection(collections.PRODUCT_COLLECTION).updateMany(
              {
                "productCategory": data.data.offerCategory
              },
              {
                $unset:{
                  "productVariants.$[].offerPrice": "",
              "productVariants.$[].offer": ""

                }
              })

            })

            db.get().collection(collections.CATEGORY_OFFER).deleteMany({
              "data.expiryDate": {
                $lte: today
            }})
              
        }
        else{
        }
        

        // checking for product offer expiry
        let proOfferExist = await db.get().collection(collections.PRODUCT_OFFER).find({
          "data.expiryDate": {
            $lte: today
          },
        }).toArray() 

        if(proOfferExist){

          proOfferExist.map(async(data)=>{
            await db.get().collection(collections.PRODUCT_COLLECTION).updateMany(
              {
                "productName": data.data.offerProduct
              },
              {
                $unset:{
                  "productVariants.$[].offerPrice": "",
              "productVariants.$[].offer": ""

                }
              })

            })

            db.get().collection(collections.PRODUCT_OFFER).deleteMany({
              "data.expiryDate": {
                $lte: today
          }})
              
        }
        else{
        }

        // delete expired coupon code

          await db.get().collection(collections.COUPON_OFFER).deleteMany({
            "expiryDate": {
              $lte: today
              }
          })

        resolve(true)
      })
    },
    
    getAllSubcategory:()=>{
      return new Promise(async(resolve,reject)=>{
        let allSub = await db.get().collection(collections.PRODUCT_CATEGORY).aggregate([
          {
            $unwind: "$subcategory"
          },
          {
            $project:{
              subcategory: "$subcategory"
            }
          }
        ]).toArray()
        resolve(allSub)
      })
    },

    // get all brands for product list page
    getAllBrands:()=>{
      return new Promise(async(resolve,reject)=>{
        let allBrands = await db.get().collection(collections.BRAND_COLLECTION).find({}).toArray()
        resolve(allBrands)
      })
    },

    getSubcatProducts:(subName)=>{
      return new Promise(async (resolve,reject)=>{
        let subProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
          {
            $match:{
              productSubcategory: subName
            }
          }
        ]).toArray()
        resolve(subProducts)
      })
    },

    getBrandProducts:(brandName)=>{
      return new Promise(async (resolve,reject)=>{
        let brandProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
          {
            $match:{
              productBrand: brandName
            }
          }
        ]).toArray()
        resolve(brandProducts)
      })
    },

    getSalesReport:(fromDate,tillDate)=>{
      return new Promise(async (resolve,reject)=>{
        let salesReport = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
            $unwind: "$products"
          },
          {
            $project:{
              item: "$products.item",
              quantity: "$products.quantity",
              subTotal: "$products.subTotal",
              status: "$products.status",
              date: "$date"
            }
          },
          {
            $match: {
               $or:[ {status: "Delivered"},{status: "Placed"},{status:"Packed"},{status: "Shipped"} ],
               date:{
                 $gte:fromDate,
                 $lte:tillDate
               }
            }
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $project:{
              quantity:1,
              subTotal:1,
              products: "$products",
              productName: "$products.productName"
            }
          },
          {
            $unwind: "$products.productVariants"
          },
          {
            $project:{
              quantity:1,
              subTotal:1,
              productCategory: "$products.productCategory",
              productName: "$products.productName",
              productVariants: "$products.productVariants"
            }
          },
          {
            $group:{
              _id: "$productName",
              totalQty: {$sum: "$quantity"},
              totalSale: {$sum: "$productVariants.productPrice"},
              productVariants: {"$first": "$productVariants"},
              netCost: {
                $sum:{
                  $multiply: ["$quantity","$productVariants.landingCost"]
                }
              },
            },
          },
          {
            $project:{
              _id:1,
              totalQty:1,
              totalSale:1,
              productVariants:1,
              netCost:1,
              profit: {
                $subtract:["$totalSale","$netCost"]
              }
            }
          }
        ]).toArray()
        
        resolve(salesReport)
      })
    },
    getStockReport:()=>{
      return new Promise(async (resolve,reject)=>{
        let stockReport = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
            $unwind: "$products"
          },
          {
            $project:{
              item: "$products.item",
              quantity: "$products.quantity",
              subTotal: "$products.subTotal",
              status: "$products.status",
              date: "$date"
            }
          },
          {
            $match: {
               $or:[ {status: "Delivered"},{status: "Placed"},{status:"Packed"},{status: "Shipped"} ],
            }
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $project:{
              quantity:1,
              subTotal:1,
              products: "$products",
              productName: "$products.productName"
            }
          },
          {
            $unwind: "$products.productVariants"
          },
          {
            $project:{
              quantity:1,
              subTotal:1,
              productCategory: "$products.productCategory",
              productName: "$products.productName",
              productVariants: "$products.productVariants"
            }
          },
          {
            $group:{
              _id: "$productName",
              totalQty: {$sum: "$quantity"},
              productVariants: {"$first": "$productVariants"},
            },
          },
          {
            $project:{
              _id:1,
              totalQty:1,
              productVariants:1,
            }
          }
        ]).toArray()
        
        resolve(stockReport)
      })
    },

    getBestSelling:()=>{
      return new Promise(async(resolve,reject)=>{
        let topSelling = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
          {
            $unwind: "$products"
          },
          {
            $project:{
              item: "$products.item",
              quantity: "$products.quantity",
              subTotal: "$products.subTotal"
            }
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products"
            }
          },
          {
            $unwind: "$products"
          },
          {
            $project:{
              quantity:1,
              products: "$products",
              productName: "$products.productName"
            }
          },
          {
            $group:{
              _id: "$productName",
              totalQty: {$sum: "$quantity"},
              products: {"$first": "$products"},
            }
          },
          {
            $sort:{totalQty:-1}
          },
          {
            $limit: 8
          }
        ]).toArray()
        resolve(topSelling)
      })
    },
    addCarousel: (carousel) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection("carousel")
          .insertOne(carousel)
          .then((data) => {
            resolve(data.insertedId);
          });
      });
    },
    // ===========================getAllcarousel==============
    getAllcarousel: () => {
      return new Promise(async (resolve, reject) => {
        let carousel = await db
          .get()
          .collection(collections.CAROUSEL_COLLECTION)
          .find()
          .toArray();
        resolve(carousel);
      });
    }, 

    // ===============================category for home page===========
    getAllcategory: () => {
      return new Promise(async (resolve, reject) => {
        let category = await db
          .get()
          .collection(collections.PRODUCT_CATEGORY)
          .find()
          .toArray();
        resolve(category);
      });
    },
    // ===========================Top offer Product=============
    getOfferproducts: () => {
      return new Promise(async (resolve, reject) => {
        let product = await db
          .get()
          .collection(collections.PRODUCT_COLLECTION)
          .find({ offerpercentage: { $gt: "25" } })
          .toArray();
  
        resolve(product);
      });
    },
  
}