const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/multerimages')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, "Image" + '-' +Date.now()+".jpg" )
    }
  })
  
  const upload = multer({ storage: storage })
  module.exports=upload;