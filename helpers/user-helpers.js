var db = require("../config/connection");
var collections = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
let referralCodeGenerator = require('referral-code-generator')


const Razorpay = require("razorpay");
const { resolve } = require("path");
const productHelper = require("./product-helper");
const collection = require("../config/collection");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEYID,
  key_secret: process.env.RAZORPAY_KEYSECRET,
});


module.exports = {
  // Add user data to Database
  addUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.confirmPass = await bcrypt.hash(userData.password, 10);
      let today = Date(Date.now());
      let date = today.toString();
      referel=referralCodeGenerator.alphaNumeric('uppercase', 2, 3)
      userData.date = date;
      userData.referel=referel;
      // userData.walletAmount=0;
      
      db.get()
        .collection(collections.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve({ status: true,data });
        });
    });
  },
// ==========================ReferelLink Checking================================
verifyReferel:(id)=>{
  return new Promise(async (resolve, reject) => {
   let Arun= await db.get().collection(collections.USER_COLLECTION).find({referel:id}).toArray()
   if (Arun) {
    resolve({
      userIs: true,
      msg: "User with this referel id is not exist",
    });
  } else {
    resolve({ useris: false });
  }

  })

},wallet:(id,user,Amount)=>{
  return new Promise(async(resolve,reject)=>{

    let WalletExist= await db.get().collection(collections.USER_COLLECTION).find({referel:id,walletAmount: { $exists: true }}).toArray()
if(WalletExist[0].walletAmount){
  TotalAmount=WalletExist[0].walletAmount+Amount
  // console.log(WalletExist,"WalletAmount uSer-helper59");
  await db.get().collection(collections.USER_COLLECTION).updateOne({referel:id},{
    
    $push: {
      yourReferels: {user},
    },
    $set:{
      walletAmount:TotalAmount

    },
  
})

}else{
   
  await db.get().collection(collections.USER_COLLECTION).updateOne({referel:id},{
    
      $push: {
        yourReferels: {user},
      },
      $set:{
        walletAmount:Amount

      },
    
  })}
resolve()
})

},





  // checking login details on database
  loginUser: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
           
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  // checking OTP number details on database
  phoneCheck: (userPhone) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ phone: userPhone });
      if (user) {
        resolve({ userExist: true, user });
      } else {
        resolve({ userExist: false });
      }
    });
  },
  // =================checking Email details of user on database===================
  emailCheck: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .find({ email: userEmail }).toArray();
        console.log(user,"userhelper80");
      if (user) {
        resolve({ userExist: true, user });
      } else {
        resolve({ userExist: false });
      }
    });
  },


  // checking duplication of User details on database
  userCheck: (userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({
          $or: [{ email: userData.email }, { phone: userData.phone }],
        });
      if (user) {
        resolve({
          userExist: true,
          msg: "User with this Phone number or email already exist",
        });
      } else {
        resolve({ userExist: false });
      }
    });
  },

  // ==============================Reset password
  resetPass: (resetData) => {
    return new Promise(async (resolve, reject) => {
      resetData.newPass = await bcrypt.hash(resetData.newPass, 10);
      
      
      db.get()
        .collection(collections.USER_COLLECTION)
        .updateOne(
          { phone: resetData.phonenumber },
          {
            $set: {
              password: resetData.newPass,
            },
          }
        )
        .then((data) => {
          resolve({ status: true });
        });
    });
  },

  // =========================reset pass with emaillink===============
   
    resetPassemail: (resetData) => {
      return new Promise(async (resolve, reject) => {
        resetData.newPass = await bcrypt.hash(resetData.newPass, 10);
        
        
        db.get()
          .collection(collections.USER_COLLECTION)
          .updateOne(
            { email: resetData.email },
            {
              $set: {
                password: resetData.newPass,
              },
            }
          )
          .then((data) => {
            resolve({ status: true });
          });
      });
    },

  addToCart: (proId, userId, total) => {
    total = parseInt(total)
    let prodObj = {
      item: objectId(proId),
      quantity: 1,
      subTotal:total,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let prodExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (prodExist == -1) {
        //   db.get()
        //     .collection(collections.CART_COLLECTION)
        //     .updateOne(
        //       { user: objectId(userId), "products.item": objectId(proId) },
        //       {
        //         $inc: { "products.$.quantity": 1 },
        //       }
        //     )
        //     .then(() => {
        //       resolve();
        //     });
        // } 
        // else {}
          await db
            .get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
        else{
          resolve({productExist:true})
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then(() => {
            resolve();
          });
      }
    });
  },

  addToWishlist: (proId,userId)=>{
    return new Promise(async (resolve,reject)=>{
      let isExist = await db.get().collection(collections.USER_WISHLIST).findOne({user: objectId(userId)})
      if(isExist){
        let prodExist = isExist.products.findIndex((product)=> product.productId == proId)

        if(prodExist == -1){
          await db
            .get()
            .collection(collections.USER_WISHLIST)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products:{"productId": objectId(proId) }},
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
        else{
          resolve({productExist: true})
        }
      }
      else{
        let wishlistObj = {
          user: objectId(userId),
          products: [{productId:objectId(proId)}]
        }

        db.get()
          .collection(collections.USER_WISHLIST)
          .insertOne(wishlistObj)
          .then(() => {
            resolve();
          });
      }

    })
  },

  getWishlist:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let wishlist = await db.get().collection(collections.USER_WISHLIST).aggregate([
        {
          $match:{user: objectId(userId)}
        },
        {
          $unwind: "$products"
        },
        {
          $project:{
            item: "$products.productId"
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
          $unwind: "$product"
        },
        {
          $project:{
            product: "$product",
            _id: 0
          }
        }
        
      ]).toArray()
      
      resolve(wishlist)
    })
  },

  getSearchProduct:(data)=>{
    return new Promise(async(resolve,reject)=>{
      let result = await db.get().collection(collections.PRODUCT_COLLECTION).find({productName:{$regex: new RegExp(data+'.*','i')}}).toArray()
      resolve(result)
    })
  },

  removeWishlist:(proId,userId)=>{
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collections.USER_WISHLIST).updateOne(
        {
          user: objectId(userId),
          "products.productId": objectId(proId)
        },
        {
          $pull:{
            products:{
              productId: objectId(proId)
            }
          }
        }
      ).then((res)=>{
        
        resolve(true)
      })
    })
  },



  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
              subTotal: "$products.subTotal"
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              subTotal:1,
              product: {
                $arrayElemAt: ["$product", 0],
              },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
       
      }
      resolve(count);
    });
  },

  changeQuantity: (data) => {
    productTotal = parseInt(data.productTotal)
    price = parseInt(data.price)
    count = parseInt(data.count);
    return new Promise((resolve, reject) => {
      if (data.count == -1 && data.quantity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(data.cartId) },
            {
              $pull: { products: { item: objectId(data.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(data.cartId),
              "products.item": objectId(data.product),
            },
            {
              $inc: { "products.$.quantity": count,"products.$.subTotal": price*count },
            },
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },

  getGrandTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            $unwind: "$products",
          },
          {
            $group: {
              "_id": objectId(userId),
              "grandTotal": {$sum:"$products.subTotal"}
            }
          }
        ])
        .toArray();
      resolve(total)
    });
  },

  deleteCartProduct: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(data.cartId) },
          {
            $pull: { products: { item: objectId(data.proId) } },
          }
        )
        .then((response) => {
          resolve(true);
        });
    });
  },



  placeOrder:(order,userId,address,products,total,code)=>{
    return new Promise((resolve,reject)=>{

      let deliveryStatus = order=="COD"?'Placed':'Pending'
      products.forEach(element => {
        element.status = deliveryStatus
      });

      let orderObj = {
        deliveryDetails:{
            
            name: address.name,
            email:address.email,
            phone: address.phone,
            houseNumber: address.houseNumber,
            streetAddress: address.streetAddress,
            locality:address.locality,
            pincode: address.pincode,
            district:address.district,
            state: address.state,
        },
        userId: objectId(userId),
        dateISO: new Date().toLocaleString(),
        date: new Date(),
        paymentMethod: order,
        totalAmount:total,
        products:products,
      }
      if(order === 'COD'){ 
        
        // if order is COD, then add the user id on coupon collection
        if(code != 'undefined'){
          db.get().collection(collections.COUPON_OFFER).updateOne({couponCode: code},{
            $push:{
              usedUsers: {
                userId: objectId(userId)
              }
            }
          })
        }

        // Decrease stock count on placing order for COD orders
        products.map((product)=>{
          db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: objectId(product.item)},{
            $inc:{
              "productVariants.$[].productQuantity": -product.quantity
            }
          })          // FOR DECREASING STOCK ON PRODUCT VARIANTS, NEEDED TO CHANGE THIS QUERY 
        })

        
        db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((resp)=>{
          db.get().collection(collections.CART_COLLECTION).deleteOne({user: objectId(userId)})
          resolve()
        })
        
      }
      else{
        db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((resp)=>{
        })

      }

      resolve(orderObj)


    })
  },


  placeBuynowOrder:(order,userId,address,products,total,code)=>{
    return new Promise((resolve,reject)=>{

      let deliveryStatus = order=="COD"?'Placed':'Pending'

      let prod

      products.map((elem)=>{
        prod = elem
      })

      let product = [{
        item: prod._id,
        quantity:1,
        subTotal:total,
        status: deliveryStatus,
      }]

      let orderObj = {
        deliveryDetails:{
            addressType: address.addressType,
            name: address.name,
            phone: address.phone,
            houseNumber: address.houseNumber,
            streetAddress: address.streetAddress,
            locality:address.locality,
            pincode: address.pincode,
            district:address.district,
            state: address.state,
        },
        userId: objectId(userId),
        dateISO: new Date().toLocaleString(),
        date: new Date(),
        paymentMethod: order,
        totalAmount:total,
        products:product,
      }

      if(order == 'COD'){

        // if order is COD, then add the user id on coupon collection
        if(code != 'undefined'){
          db.get().collection(collections.COUPON_OFFER).updateOne({couponCode: code},{
            $push:{
              usedUsers: {
                userId: objectId(userId)
              }
            }
          })
        }
      }
      // Decrease stock count on placing order for COD orders
      product.map((products)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: objectId(products.item)},{
          $inc:{
            "productVariants.$[].productQuantity": -products.quantity
          }
        })          // FOR DECREASING STOCK ON PRODUCT VARIANTS, NEEDED TO CHANGE THIS QUERY 
      })


      db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((resp)=>{
      })
      
      resolve(orderObj)
    })
  },

  generateRazorpay:(rzpId,total)=>{
    return new Promise((resolve,reject)=>{
      var options = {
        amount: total*100,
        currency: "INR",
        receipt: ""+rzpId
      }
      console.log(options);
      instance.orders.create(options,(err,order)=>{
        if(err){
          console.log(err);
        }
        else{
          resolve(order)
        }
      })
    })
  },


  verifyPayment: (details) => {
    console.log(details);
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEYSECRET);

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      console.log(hmac);
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  getrelatedproducts: (relatedprod) => {
   
    return new Promise(async (resolve, reject) => {
      let relatedpro = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find({ productSubcategory: relatedprod })
        .toArray();
       
      resolve(relatedpro);
    });
  },





  
  changePaymentStatus:(orderDetails,isBuyNow,code,userId)=>{
    return new Promise((resolve,reject)=>{

      if(code == 'undefined'){
      }
      else{
        
        db.get().collection(collections.COUPON_OFFER).updateOne({couponCode: code},{
          $push:{
            usedUsers: {
              userId: objectId(userId)
            }
          }
        })
      }


      // Decrease stock count on placing orders
      orderDetails.products.map((product)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: objectId(product.item)},{
          $inc:{
            "productVariants.$[].productQuantity": -product.quantity
          }
        })          // FOR DECREASING STOCK ON PRODUCT VARIANTS, NEEDED TO CHANGE THIS QUERY 
      })
      

      if(isBuyNow){
        db.get().collection(collections.ORDER_COLLECTION).updateMany({_id: objectId(orderDetails._id),"products.status": "Pending"},{
          $set:{
            "products.$[].status": "Placed"
          }
        })
      }
      else{
        db.get().collection(collections.ORDER_COLLECTION).updateMany({_id: objectId(orderDetails._id),"products.status": "Pending"},{
          $set:{
            "products.$[].status": "Placed"
          }
        }).then(()=>{
          db.get().collection(collections.CART_COLLECTION).deleteOne({user: objectId(orderDetails.userId)})
          resolve()
        })
      }

        resolve(true)

    })
  },



  getCartProductsList:(userId)=>{
    return new Promise(async (resolve,reject)=>{
      let cartProducts = await db.get().collection(collections.CART_COLLECTION).findOne({user: objectId(userId)})
      resolve(cartProducts?.products)
    })
  },


  getAllOrders: (userId)=>{
    return new Promise(async(resolve,reject)=>{
      let allOrders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
        {
          $match:{
            userId: objectId(userId)
          }
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
            cancelled: "$products.cancelled",
            delivered: "$products.delivered",
            dateISO: "$dateISO",
            date: "$date",
            paymentMethod: "$paymentMethod",
            deliveryDetails: "$deliveryDetails"
          }
        },
        {
          $lookup:{
            from: collections.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as: "products"
          }
        },
        {
          $project:{
            item:1,
            quantity:1,
            subTotal:1,
            status:1,
            dateISO:1,
            date:1,
            deliveryDetails:1,
            cancelled:1,
            delivered:1,
            paymentMethod:1,
            product: {
              $arrayElemAt: ["$products",0]
            }
          }
        },
        {
          $unwind: "$product.productVariants"
        },
        {
          $sort:{date: -1}
        }
      ]).toArray()
      resolve(allOrders)
    })
  },


  cancelProduct:(orderId,proId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collections.ORDER_COLLECTION).updateOne({_id: objectId(orderId),"products.item": objectId(proId)},
      {
        $set: {
          "products.$.status": "Cancelled",
          "products.$.cancelled": true
        }
      })
      resolve()
    })
  },



  addAddress: (userId, data) => {
    data.addressId = new objectId()
    return new Promise(async (resolve, reject) => {
      let addressExist = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({
          _id: objectId(userId._id),
          address: { $exists: true },
        });

      if (addressExist) {
        await db
          .get()
          .collection(collections.USER_COLLECTION)
          .findOne(
            {
              address: {
                $elemMatch: {
                  name: data.name,
                  phone: data.phone,
                  pincode: data.pincode,
                  locality: data.locality,
                  houseNumber: data.houseNumber,
                  streetAddress: data.streetAddress,
                  district: data.district,
                  state: data.state,
                  email:data.email,
                },
              },
            }
          )
          .then((response) => {
            if (response) {
            
              resolve({addressExist:true});
            } else {
              db.get()
                .collection(collections.USER_COLLECTION)
                .updateOne(
                  { _id: objectId(userId._id) },
                  {
                    $push: {
                      address: data,
                    },
                  }
                )
                .then(() => {
                  resolve()
                });
            }
          });
      } else {
        await db
          .get()
          .collection(collections.USER_COLLECTION)
          .updateOne(
            { _id: objectId(userId._id) },
            {
              $set: {
                address: [data],
              },
            }
          )
          .then(() => {
            resolve()
          });
      }
    });
  },

  // get user address
  getAddress:(userId)=>{
    return new Promise(async (resolve,reject)=>{
      let allAddress = await db.get().collection(collections.USER_COLLECTION).aggregate(
        [{
        $match:{
          _id: objectId(userId)
            }
        },
        {
          $project:{
            address:1,
            _id:0
          }
        },
        {
          $unwind:'$address'
        }
    ]).toArray()
      resolve(allAddress);
    })
  },

  deleteAddress: (userId,addressId)=>{
    return new Promise(async (resolve,reject)=>{
      await db.get().collection(collections.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId),
          "address.addressId":objectId(addressId)
        },
        {
          $pull: {
            address: {
              addressId: objectId(addressId)
            }
          }
        }).then((response)=>{
          
          resolve(resolve)
        })
    })
  },
// ===================================get One Address of user==============
getMybrands:(brand)=>{
return new Promise(async (resolve,reject)=>{
  let userBrands = await db.get().collection(collections.PRODUCT_COLLECTION).find({productBrand:brand}).toArray()
  console.log(userBrands);
  resolve(userBrands)

})
},

  getOneAddress: (addressId,userId)=>{
    return new Promise(async (resolve,reject)=>{
      let oneAddress = await db.get().collection(collections.USER_COLLECTION).aggregate(
        [
        {
          $match:{
            _id: objectId(userId)
          }
        },
        {
          $unwind: "$address"
        },
        {
          $match:{
            "address.addressId": objectId(addressId)
          }
        },
        
      ]).toArray()  
      console.log(oneAddress,"address for order 891");
      resolve(oneAddress);
    })
  },

  // edit user address
  editAddress:(userId,data,addressId)=>{
    return new Promise(async (resolve,reject)=>{
      
      await db.get().collection(collections.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId),
          "address.addressId": objectId(addressId)
        },
        {
          $set: {
            "address.$.email": data.email,
            "address.$.name": data.name,
            "address.$.phone": data.phone,
            "address.$.pincode": data.pincode,
            "address.$.locality": data.locality,
            "address.$.houseNumber": data.houseNumber,
            "address.$.streetAddress": data.streetAddress,
            "address.$.district": data.district,
            "address.$.state": data.state,
          }
        }
        ).then((resp)=>{
          
          resolve(resp)
        })
    })
  },

  editProfile:(userId,data)=>{
    return new Promise(async (resolve,reject)=>{
      
      await db.get().collection(collections.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId),
        },
        {
          $set: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            phone: data.phone,
          }
        }
        ).then((resp)=>{
          
          resolve(resp)
        })
    })
  },

  getOneUser:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders= await db.get().collection(collections.USER_COLLECTION).findOne({_id: objectId(userId)})
      
      resolve(orders) 
    })
  },

   // Change password
   changePassword: (userId,userPass) => {
    return new Promise(async (resolve, reject) => {

      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ _id: objectId(userId)});
        
        if(user){
          bcrypt.compare(userPass.currPass, user.password).then(async(status) => {
            if (status) {
              userPass.newPass = await bcrypt.hash(userPass.newPass, 10);
              db.get()
                .collection(collections.USER_COLLECTION)
                .updateOne(
                  {_id: objectId(userId)},
                  {
                    $set: {
                      password: userPass.newPass,
                    },
                  }
                ).then((resp)=>{
                  if(resp){
                    resolve({status:true})
                  }
                  else{
                    resolve({status:false,changePassMsg: 'Password not updated'})                  }
                })
            } 
            else{
              resolve({status:false,changePassMsg: 'Please Enter Current Password Correctly'})
            }
          })
        }
      });
  },

  updatedwallet:(id,amount)=>{

    
    return new Promise(async(resolve,reject)=>{
     let arun= await db.get().collection(collections.USER_COLLECTION).find({_id:objectId(id)}).toArray()
     let remaining=parseInt (arun[0].walletAmount)-amount
     console.log(arun[0].walletAmount);
     let arunms= await db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(id)},{
       $set:{
        walletAmount:remaining
       }
     })
       
      console.log(arun,"userhelpers1107");
      resolve()
    })
  },
  getwalletAmount:(id)=>{
    return new Promise(async(resolve,reject)=>{
      let wallet= await db.get().collection(collections.USER_COLLECTION).find({_id:objectId(id)}).toArray()
      console.log(wallet);
      resolve(wallet)
    })
  }
};
