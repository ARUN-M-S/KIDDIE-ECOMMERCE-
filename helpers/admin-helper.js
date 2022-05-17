var db = require("../config/connection");
var collections = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("express");
const { Collection } = require("mongodb");

module.exports = {
  // Add product category to Database
  addCategory: (categoryData) => {
    return new Promise(async (resolve, reject) => {
      let isCategory = await db
        .get()
        .collection(collections.PRODUCT_CATEGORY)
        .findOne({ category: categoryData.category }); //finds for a document of category in req.body

      if (isCategory) {
        let dbSubcategory = isCategory.subcategory;
        let isSub = dbSubcategory.includes(categoryData.subcategory); //checks whether same subcategory is in subcategory array

        if (isSub) {
          //if same subcategory is in subcategory array shows error
          resolve({ status: false, msg: "This Subcategory Already Exist" });
        } else {
          //else update subcategory of that category
          await db
            .get()
            .collection(collections.PRODUCT_CATEGORY)
            .updateOne(
              { category: categoryData.category },
              { $push: { subcategory: categoryData.subcategory } }
            );

          resolve({
            status: true,
            msg: "Subcategory Added to Existing Category",
          });
        }
      } else {
        //if thereis no document of category, create category and subcategory
        await db
          .get()
          .collection(collections.PRODUCT_CATEGORY)
          .insertOne({
            category: categoryData.category,
            subcategory: [categoryData.subcategory],
          });
        resolve({
          status: true,
          msg: "Category Added Successfully",
        });
      }
    });
  },
  //   get category datas
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let allCategory = await db
        .get()
        .collection(collections.PRODUCT_CATEGORY)
        .find()
        .toArray();
      resolve(allCategory);
    });
  },


  //=======================   get brand datas===========================
  getBrand: () => {
    return new Promise(async (resolve, reject) => {
      let allBrand = await db
        .get()
        .collection(collections.BRAND_COLLECTION)
        .find({})
        .toArray();
      resolve(allBrand);
    });
  },

  //===================== Add product brand to Database===================
  addBrand: (brandData) => {
    return new Promise(async (resolve, reject) => {
      let isBrand = await db
        .get()
        .collection(collections.BRAND_COLLECTION)
        .findOne({ brandName: brandData.brandName }); //finds for a document of brand in req.body 
      if (isBrand) {
        if (isBrand?.brandName === brandData.brandName) {
          //if same brand is in database brand, shows error
          resolve({ status: false, msg: "This Brand Already Exist" });
        }
      } else {
        //if thereis no document of brand, add brand
        await db.get().collection(collections.BRAND_COLLECTION).insertOne(brandData).then((result)=>{
          resolve({
            result,
            status: true,
            msg: "New Brand Added Successfully",
          });
        })
      }
    });
  },


//========================== Get all users details======================
  getUsers:()=>{
    return new Promise(async (resolve,reject)=>{
      let allUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray()
      resolve(allUsers)
    })
  },

 // =============================block user from admin page=====================
 blockUser: (userId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collections.USER_COLLECTION)
      .updateOne({ _id: objectId(userId) }, { $set: { userBlocked: true } })
      .then((data) => {
        resolve(data);
      });
  });
},

 // unblock user from admin page
 unblockUser: (userId) => {
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collections.USER_COLLECTION)
      .updateOne({ _id: objectId(userId) }, { $set: { userBlocked: false } })
      .then((data) => {
        resolve(data);
      });
  });
},

checkBlock:(blockId)=>{
  return new Promise(async (resolve, reject) => {
   let res = await db.get()
      .collection(collections.USER_COLLECTION)
      .findOne({ _id: blockId})
        resolve(res);
  });
},
getBlockedUsers:()=>{
  return new Promise(async (resolve,reject)=>{
    let blockedUsers = await db.get().collection(collections.USER_COLLECTION).find({userBlocked: true}).toArray()
    resolve(blockedUsers)
  })
},


viewOrders:()=>{
  return new Promise(async (resolve,reject)=>{
    let orders = await db.get().collection(collections.ORDER_COLLECTION).find({}).toArray()
    resolve(orders)
  })
},


deliveryStatusUpdate:(status,orderId,proId)=>{
  return new Promise(async (resolve,reject)=>{
    if(status == 'Cancelled'){
        db.get().collection(collections.ORDER_COLLECTION).updateOne({_id: objectId(orderId),"products.item": objectId(proId)},
      {
        $set:{ 
          "products.$.status": status,
          "products.$.cancelled": true,
          "products.$.delivered": false,
         }
      })
    }
    else if(status == 'Delivered'){
      db.get().collection(collections.ORDER_COLLECTION).updateOne({_id: objectId(orderId),"products.item": objectId(proId)},
      {
        $set:{ 
          "products.$.status": status,
          "products.$.cancelled": false,
          "products.$.delivered": true,

         }
      })
    }
    else{
      db.get().collection(collections.ORDER_COLLECTION).updateOne({_id: objectId(orderId),"products.item": objectId(proId)},
      {
        $set:{ 
          "products.$.status": status,
          "products.$.cancelled": false,
          "products.$.delivered": false,
        }
      }).then((response)=>{
        })
      }
      resolve(true)
  })
},

addBanner:(body)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.BANNER_COLLECTION).update({},{
     $set:{
      topHead1: body.topHead1,
      topText1: body.topText1,
      topHead2: body.topHead2,
      topText2: body.topText2,
      topHead3: body.topHead3,
      topText3: body.topText3,
      offerHead: body.offerHead,
      offerText: body.offerText,
     } 
    })
    resolve(true)
  })
},

getBanner:()=>{
  return new Promise(async (resolve,reject)=>{
    let allBanner = await db.get().collection(collections.BANNER_COLLECTION).findOne({})
    resolve(allBanner)
  })
},


getRevenue:()=>{
  return new Promise(async (resolve,reject)=>{
    let revenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{"products.status": "Delivered"}
      },
      {
        $project:{
          subTotal: "$products.subTotal"
        }
      },
      {
        $project:{
          subTotal: 1,
          _id:0
        }
      },
      {
        $group:{
          _id:null,
          totalRevenue:{$sum:"$subTotal"}
        }
      }
    ]).toArray()

    resolve(revenue[0]?.totalRevenue)
  })
},


getTotalProducts:()=>{
  return new Promise(async (resolve,reject)=>{
    let totalProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
      {
        $unwind: "$productVariants"
      },
      {
        $count: "prdouctsCount"
      }
    ]).toArray()
    resolve(totalProducts[0]?.prdouctsCount)
  })
},


getDeliveredOrders:()=>{
  return new Promise(async (resolve,reject)=>{
    let deliveredOrders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{"products.status": "Delivered"}
      },
      {
        $count: "deliveredCount"
      }
    ]).toArray()

    resolve(deliveredOrders[0]?.deliveredCount)
  })
},


getTotalUsers:()=>{
  return new Promise(async (resolve,reject)=>{
    let totalUsers = await db.get().collection(collections.USER_COLLECTION).find({}).count()
    resolve(totalUsers)
  })
},


getdailySales:()=>{
  return new Promise(async(resolve,reject)=>{
    let dailySale = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{
          "products.status": "Delivered"
        }
      },
      {
        $group:{
          _id: {$dateToString: {format: "%Y-%m-%d",date:"$date"}},
          totalAmount: {$sum:"$products.subTotal"},
          count:{$sum:1}
        }
      },
      {
        $sort: {_id:-1}
      },
      {
        $limit: 7
      }
    ]).toArray()
    resolve(dailySale)
  })
},
// ===================================GetCategorywisesale==========================

getCatSales:()=>{
  return new Promise(async(resolve,reject)=>{
    let catSales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{
          "products.status": "Delivered"
        }
      },
      {
        $project:{
          item: "$products.item",
          quantity: "$products.quantity",
          subTotal: "$products.subTotal"
        }
      },
      {
        $lookup:{
          from: collections.PRODUCT_COLLECTION,
          localField: "item",
          foreignField: "_id",
          as: "orderedProducts"
        }
      },
      {
        $unwind: "$orderedProducts"
      },
      {
        $project:{
          quantity:1,
          subTotal:1,
          category: "$orderedProducts.productSubcategory"
        }
      },
      {
        $group:{
          _id: "$category",
          totalAmount: {$sum:"$subTotal"},
          count:{$sum:1}
        }
      }
    ]).toArray()
    resolve(catSales)
  })
},
// ======================================Monthysale==========================
getMonthlySales:()=>{
  return new Promise(async(resolve,reject)=>{
    let monthlySale = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{
          "products.status": "Delivered"
        }
      },
      {
        $group:{
          _id: {$dateToString: {format: "%Y-%m",date:"$date"}},
          totalAmount: {$sum:"$products.subTotal"},
          count:{$sum:1}
        }
      },
      {
        $sort: {_id:-1}
      },
     
    ]).toArray()
    resolve(monthlySale)
  })
},
// =======================================YearlySales====================
getYearlySales:()=>{
  return new Promise(async(resolve,reject)=>{
    let yearlySale = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
      {
        $unwind: "$products"
      },
      {
        $match:{
          "products.status": "Delivered"
        }
      },
      {
        $group:{
          _id: {$dateToString: {format: "%Y",date:"$date"}},
          totalAmount: {$sum:"$products.subTotal"},
          count:{$sum:1}
        }
      },
      {
        $sort: {_id:-1}
      },
     
    ]).toArray()
    resolve(yearlySale)
  })
},
getTopSelling:()=>{
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
        }
      },
      {
        $sort:{totalQty:-1}
      },
      {
        $limit: 5
      }
    ]).toArray()
    resolve(topSelling)
  })
},

getStockOut:()=>{
  return new Promise(async(resolve,reject)=>{
    let stockOut = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
      {
        $unwind: "$productVariants"
      },
      {
        $project:{
          productName: "$productName",
          quantity: "$productVariants.productQuantity",
        }
      },
      {
        $group:{
          _id: "$productName",
          stock: {$sum: "$quantity"},
        }
      },
      {
        $sort:{stock:1}
      },
      {
        $match:{
          stock:{
            $lte: 30
          }
        }
      }
    ]).toArray()
    resolve(stockOut)
  })
},

getUserReport:()=>{
  return new Promise(async(resolve,reject)=>{
    let userReport = await db.get().collection(collections.USER_COLLECTION).aggregate([
      {
        $lookup:{
          from: collections.ORDER_COLLECTION,
          localField: "_id",
          foreignField: "userId",
          as: "userOrders"
        }
      },
      {
        $project:{
          firstName: "$firstName",
          lastName: "$lastName",
          phone: "$phone",
          email: "$email",
          userOrders: "$userOrders"
        }
      },
      {
        $unwind: "$userOrders"
      },
      {
        $project:{
          firstName: 1,
          lastName:1,
          phone: 1,
          email: 1,
          totalAmount: "$userOrders.totalAmount",
          paymentMethod: "$userOrders.paymentMethod"
        }
      },
      {
        $group:{
          _id: "$firstName",
          totalAmount: {$sum: "$totalAmount"},
          phone: {$first: "$phone"},
          email: {$first: "$email"},
          lastName: {$first: "$lastName"},
        }
      }
    ]).toArray()
    resolve(userReport)
  })
}



};
