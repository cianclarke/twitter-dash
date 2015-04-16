var express = require('express'),
Twitter = require('twitter'),
dbClient = require('../lib/db')(),
subscribers = {},
streams = {};

function subscribe(hashtag){
  var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
  client.stream('statuses/filter', {track: hashtag}, function(stream) {
    // Allows us to close the stream when 0 subscribers reached
    streams[hashtag] = stream;
    
    stream.on('data', function(tweet) {
      // add to our db for data crunching later
      dbClient.insert(hashtag, tweet, function(){/*noop, fire and forget*/});
      // emit to all our subscribers
      subscribers[hashtag].forEach(function(socket){
        var tweetCountry = tweet && tweet.place && tweet.place.country || false;
        // If this socket has a country filter, perform this here
        if (socket.country && socket.country !== tweetCountry ){
          return;
        }
        socket.emit('tweet', tweet);
      });
      
    });
    stream.on('error', function(error) {
      console.error('Issue with hashtag ' + hashtag + ':');
      console.error(error);
    });
  });
}

module.exports = function(io){
  var router = express.Router();
  io.on('connection', function(socket){
    socket.on('country', function(country){
      // Socket has told us it wants to filter by country
      socket.country = country;
    });
    socket.on('subscribe', function(hashtag){
      socket.hashtag = hashtag;
      subscribers[hashtag] = subscribers[hashtag] || [];
      if (subscribers[hashtag].length === 0){
        // Start listening to the topic
        subscribe(hashtag);
      }
      subscribers[hashtag].push(socket);
    });
    
    socket.on('disconnect', function(){
      var hashtag = socket.hashtag,
      subsToThisHashtag = subscribers[hashtag],
      index;
      
      if (!subsToThisHashtag){
        return;
      }
      index = subsToThisHashtag.indexOf(socket);
      subsToThisHashtag.splice(index, 1);
      
      if (subsToThisHashtag.length === 0){
        console.log('Destroying stream ' + hashtag);
        streams[hashtag].destroy();
      }
      
    });

  });
  
  return router;
}
 
