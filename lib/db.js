var MongoClient = require('mongodb').MongoClient,
_ = require('underscore'),
db;

var nMinutesAgo = function(n){
  return new Date(new Date().getTime() - 1000 * 60 * n).toISOString();
}

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
  findTweets : function(hashtag, country, cb){
    var collection = db.collection(hashtag);
    var query = {};
    if (country){
      query = {"place.country" : country};
    }
    collection.find(query).toArray(cb);
  },
  sortByDate : function(hashtag, cb){
    var collection = db.collection(hashtag);
    // TODO: Would be more effecient as Mongo query, but not sure about date formatting. 
    // TODO: Would be good use of map reduce here..
    collection.find({}).toArray(function(err, tweets){
      var times = _.map(tweets, function(t){ return t.created_at });
      if (err){
        return cb(err);
      }
      return cb(null, times);
    });
  }
};

module.exports = function(){
  MongoClient.connect('mongodb://127.0.0.1:27017/twitter', function(err, dbConnection) {
    if(err) throw err;
    db = dbConnection;
  });
  return dbClient;
};
