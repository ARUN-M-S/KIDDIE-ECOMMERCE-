const mongoClient = require('mongodb').MongoClient

const state = {
    db: null
}

module.exports.connect = (done)=>{
    const url = 'mongodb+srv://ARUNMS:%40KL33g1429@cluster0.jbzl1.mongodb.net/shopping?retryWrites=true&w=majority'
    const dbname = 'shopping'

    mongoClient.connect(url,(err,data)=>{
    if(err){
      return done(err);
    }
    state.db = data.db(dbname)
    done()
    
  })

}

module.exports.get = ()=>{
    return state.db
}