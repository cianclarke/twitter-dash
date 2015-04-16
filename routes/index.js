var express = require('express');
var Twitter = require('twitter');
 
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/search', function(req, res, next){
 var hashtag = req.query.hashtag;
 
 var client = new Twitter({
   consumer_key: process.env.TWITTER_CONSUMER_KEY,
   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,

 });
 client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response){
   return res.render('stream', { hashtag : hashtag, historic_tweets : tweets.statuses });
 });
});

module.exports = router;
