var MongoClient = require('mongodb').MongoClient,
db;

var dbClient = {
  insert : function(hashtag, tweet, cb){
    if (typeof hashtag !== 'string'){
      return cb('Hashtag must be a valid string');
    }
    if (typeof tweet !== 'object'){
      return cb('Tweet must be a valid twitter tweet object');
    }
    var collection = db.collection(hashtag);
    return collection.insert(tweet, cb);
  },
  countriesByHashtag : function(hashtag, cb){
    var collection = db.collection(hashtag);
    return collection.distinct('place.country', cb);
  },
  findByCountry : function(hashtag, country, cb){
    var collection = db.collection(hashtag);
    collection.find({"place.country" : country}).toArray(cb);
  },
};

module.exports = function(){
  MongoClient.connect('mongodb://127.0.0.1:27017/twitter', function(err, dbConnection) {
    if(err) throw err;
    db = dbConnection;
  });
  return dbClient;
};
