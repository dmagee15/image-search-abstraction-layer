var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var recordModel = Schema({
  "term": String,
  "date": String
});

module.exports = mongoose.model("SearchRecords", recordModel);