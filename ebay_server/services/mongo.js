
var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;

function connect(url, callback){
    MongoClient.connect(url, function (err, _db) {
        if(err) {throw new error("could not connect" + err);}
        db = _db;
        connected = true;
        console.log(db+" is connected..");
        callback(db);
    });
    connected = false;
};

function collection (name){
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    return db.collection(name);
};

function close() {
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    console.log("connection closed");
    db.close();
};

exports.connect = connect;
exports.collection = collection;
exports.close = close;
