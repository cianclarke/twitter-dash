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
   if (country){
     return db.findByCountry(hashtag, country, function(err, tweets){
       if (err){
         return res.json(err);
       }
       
       return res.render('stream', { hashtag : hashtag, historic_tweets : tweets, countries : countries });
     });
   }
   // no country specified - TODO, should we do this at all??
   client.get('search/tweets', {q: hashtag }, function(error, tweets, response){
     var statuses = tweets.statuses;
       if (err){
         return res.json(err);
       }
       return res.render('stream', { hashtag : hashtag, historic_tweets : statuses, countries : countries });
   });
 });
});

module.exports = router;
