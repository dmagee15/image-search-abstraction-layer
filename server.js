
'use strict';

var fs = require('fs');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var request = require('request');
var searchLog = require('./searchLog');
var express = require('express');
var app = express();

mongoose.connect('mongodb://test:test@ds115214.mlab.com:15214/searchapi');

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyparser.urlencoded({'extended': false}));
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
  
    })

app.get('/api/imagesearch/:searchTerm',function(req,res){
  var searchTerm = req.params.searchTerm;
  var numResults = (req.query.offset)?req.query.offset:10;
  var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyC1munvl4oBFHvOEqxudlejjo_HNMeh4pQ&cx=012735866347581411566:32f8xcnp8se&q="+searchTerm+"&searchType=image&start="+numResults;
  console.log(numResults);
  request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {

      var googleLinks = JSON.parse(body)["items"];
        
        var temp;
        var result = [];
        var length = googleLinks.length;
        
        for(var x=0;x<length;x++){
          temp = {
            "url": googleLinks[x]["link"],
            "snippet": googleLinks[x]["htmlSnippet"],
            "thumbnail": googleLinks[x]["image"]["thumbnailLink"],
            "context": googleLinks[x]["image"]["contextLink"]
          }
          result.push(temp);
        }
        
        var date = (new Date()).toString();
        
        var searchRecord = new searchLog({
          "term":searchTerm,
          "date":date
        });
        searchRecord.save();
        
        res.json(result);
      }
      })
});

app.get('/api/latest/imagesearch', function(req,res){
  searchLog.find(function(err,data){
    if(err){throw err;}
    var result = [];
    var length = data.length;
    
    for(var x=0;x<length;x++){
      result.push({
        "term": data[x]["term"],
        "date": data[x]["date"]
      });
    }
    res.json(result);
  });
});

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

