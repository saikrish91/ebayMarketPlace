
var arrayOfConnection= [];

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/ebay';
var db;

// Initialize connection once
MongoClient.connect(mongoUrl, function(err, database) {
	if(err) throw err;
	db = database;

});

exports.getdbconnection = function()
{
	return db;
}

exports.closedbconnection = function()
{
	db.close();
}

