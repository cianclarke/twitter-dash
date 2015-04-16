var express = require('express');
var Twitter = require('twitter');
var db = require('../lib/db')();
var _ = require('underscore');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/search', function(req, res, next){
 var hashtag = req.query.hashtag,
 country = req.query.country;
 
 var client = new Twitter({
   consumer_key: process.env.TWITTER_CONSUMER_KEY,
   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,

 });
 var countries = db.countriesByHashtag(hashtag, function(err, countries){
   // TODO: Callback hell - introduce async.series()
   return db.findTweets(hashtag, country, function(err, tweets){
     if (err){
       return res.json(err);
     }
     return db.sortByDate(hashtag, function(err, times){
       if (err){
         return res.json(err);
       }
       console.log(times);
       return res.render('stream', { hashtag : hashtag, historic_tweets : tweets, countries : countries, times : times });   
     });
   });
 });
});

module.exports = router;
