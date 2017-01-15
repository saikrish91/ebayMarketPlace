
var connectionpool = require('./connectionpool');
var ObjectID = require('mongodb').ObjectID;
var url  = require('url');
exports.handle_getad = function(req, callback)
{
	 var res={};
	 var connection = connectionpool.getdbconnection();

	  var vals = connection.collection('cart'+req.userid).find({}, {_id:0,itemno: 1}).map(function(a){return new ObjectID(a.itemno);}).toArray(function (err, arr) {

	    if (err) {
	      console.log(err);
	      res.code = 500;
		  res.value = err;
		  callback(null, res);
		  return;
		  //throw err;
	    } 
	    
	    connection.collection('advertisements').find({'userid':{$ne:req.userid},_id: {$nin: arr}}).toArray(function (err, result) {
	      console.log('inside query');
	      if (err) {
	    	  console.log(err);
		      res.code = 500;
			  res.value = err;
			  callback(null, res);
			  return;
	      } 
	      res.code = 200;
		  res.value = result;
	      callback(null, res);     
	    });

	  });
}
exports.handle_addtocart = function(payload,callback)
{
	  var post = new Object();
	  post.itemno = new ObjectID(payload.itemno);
	  post.quantityselected = payload.quantityselected;
	  post.userid = new ObjectID(payload.userid);
	var res = {};
	  var connection = connectionpool.getdbconnection();
	  connection.collection('cart'+payload.userid).insertOne(post, function(err, result) {
	    if(err) {
	      console.log(err);
	      res.code = 500;
		  res.value = err;
		  callback(null, res);
	      return;
	    }
	    res.code = 200;
		//res.value = result;
	    callback(null, res);  
	  });
}
exports.handle_getcart = function(payload,callback)
{
	var res = {};
	 console.log(payload._id);
	 var connection = connectionpool.getdbconnection();
	  connection.collection('cart'+payload._id).aggregate([{$lookup:{from:'advertisements',localField:'itemno',foreignField:'_id',as:'ad_info'}},{$unwind:'$ad_info'},{$project:{itemno:1,quantityselected:1,userid:1,ad_info:1,'cmp_val':{$cmp:['$ad_info.qualtity','$quantityselected']}}},{$match:{cmp_val:{'$lte':0}}}]).toArray(function (err, result) {	    
	    if (err) {
	      console.log(err);
	      res.code = 500;
		  res.value = err;
		  callback(null, res);
		  return;
	    }
	    var objToSend = new Object;
	    objToSend.cartItems = result;
	    var i = 0, total = 0;
	    for(i = 0; i < result.length; i++)
	    {
	      total = total + (result[i].quantityselected * result[i].ad_info.itemprice)
	    }
	    objToSend.carttotal = total;
	    console.log(JSON.toString(result));
	    res.code = 200;
	    res.objToSend = objToSend;
	    callback(null, res); 
	    //res.send(objToSend);
	    //Close connection
	    //db.close();
	    //res.render('billingStatus', {result:result,uservar:req.session.user.username});
	  });
}
exports.handle_removefromcart = function(payload,callback)
{
	var res = {};
	 var itemno = new ObjectID(payload.itemno);
	  var connection = connectionpool.getdbconnection();
	  connection.collection('cart'+payload._id).remove({itemno: itemno}, function(err, result) {
	    if (err) {
	      console.log(err);
	      res.code = 500;
		  res.value = err;
		  callback(null, res);
		  return;
	    }
	    console.log(result);
	    connection.collection('cart'+payload._id).aggregate([{$lookup:{from:'advertisements',localField:'itemno',foreignField:'_id',as:'ad_info'}},{$unwind:'$ad_info'},{$project:{itemno:1,quantityselected:1,userid:1,ad_info:1,'cmp_val':{$cmp:['$ad_info.qualtity','$quantityselected']}}},{$match:{cmp_val:{'$lte':0}}}]).toArray(function (err, result) {
	      if (err) {
	        console.log(err);
	        res.code = 500;
			res.value = err;
			callback(null, res);
			return;
	      } 
	      var objToSend = new Object;
	      objToSend.cartItems = result;
	      var i = 0, total = 0;
	      for(i = 0; i < result.length; i++)
	      {
	        total = total + (result[i].quantityselected * result[i].ad_info.itemprice)
	      }
	      objToSend.carttotal = total;
	      console.log(JSON.toString(result));
	      res.code = 200;
		  res.objToSend = objToSend;
		  callback(null, res); 
	    });
	  });
}
exports.handle_getcartvolume = function(payload,callback)
{
	var res = {};
	 var connection = connectionpool.getdbconnection();
	  connection.collection('cart'+payload._id).find({}).count(function (e, count) {
	    if (e) {
	        console.log(err);
	        res.code = 500;
			res.value = err;
			callback(null, res);
			return;
		} 
		console.log(count);
	    var objToSend = new Object;
	    objToSend.cartcount = count;
	    res.code = 200;
	    res.objToSend = objToSend;
	    callback(null, res); 
	  });
	
}
exports.getUserHistory = function(payload,callback){
	  var res = {};
	  var connection = connectionpool.getdbconnection();
	  connection.collection('userhistory'+payload._id).find({}).toArray(function (err, result) {
	    console.log('inside query');
	    if (err) {
	        console.log(err);
	        res.code = 500;
			res.value = err;
			callback(null, res);
			return;
		}
	    //console.log(JSON.toString(result));
	    res.code = 200;
	    res.objToSend = result;
	    callback(null, res); 
	    //res.send(result);

	  });
	};
	
exports.updateSingleUserVal = function(payload,callback){
	//  log.info('updateSingleUserVal done by ', req.session.id, ' performed at ', new Date().toJSON(),' cart item no ',req.body.cartNo);
	  //console.log(req.body);
	  var res = {};
	  var connection = connectionpool.getdbconnection();
	  var obj = {};
	  obj[payload.data] = payload.value;
	  //obj.push();
	  

	  connection.collection('ebayusers').update({ "_id": new ObjectID(payload._id) }, {$set:obj}, function(err, result) {
		    if (err) {
			  console.log(err);
			  res.code = 500;
			  res.value = err;
			  callback(null, res);
			  return;
			}
		    //do something.
		    console.log('update successful');
		    res.code = 200;
		   // res.objToSend = result;
		    callback(null, res); 
	    });
	  // res.send("success");
	};
	
	exports.getUserInfo = function(payload,callback){
		var res = {};
		 var connection = connectionpool.getdbconnection();
		  //obj.push();
		  connection.collection('ebayusers').find(
		      { "_id": new ObjectID(payload._id)}).toArray(function (err, result){
		       
		        if (err) {
				  console.log(err);
				  res.code = 500;
				  res.value = err;
				  callback(null, res);
				  return;
				}
		    	res.code = 200;
		  	    res.objToSend = result;
		  	    callback(null, res);   
		        //res.send(result);
		      }
		  );
	};
	exports.postad = function(payload,callback){
		var res = {};
		 var connection = connectionpool.getdbconnection();
		 payload.dateposted = new Date();
		  //var adCollections = connectionpool.collection('advertisements');
		  connection.collection('advertisements').insertOne(payload, function(err, result) {
		  if (err) {
			  console.log(err);
			  res.code = 500;
			  res.value = err;
			  callback(null, res);
			  return;
			}
		    payload.transactiontype = 'sold';
		    connection.collection('userhistory'+payload.userid).insertOne(payload,function(err, result) {
	    	if (err) {
				  console.log(err);
				  res.code = 500;
				  res.value = err;
				  callback(null, res);
				  return;
				}
		      res.code = 200;
		  	  //res.objToSend = result;
		  	  callback(null, res); 
		    });
		  });
	};
	exports.changeCartQuantity = function(payload,callback){
		var res = {};
		 var connection = connectionpool.getdbconnection();
		  connection.collection('cart'+payload._id).update({_id:new ObjectID(payload.cartNo)}, {$set:{quantityselected:payload.changedQuantity}}, function(err, result) {
		  if (err) {
			  console.log(err);
			  res.code = 500;
			  res.value = err;
			  callback(null, res);
			  return;
			}
		    //do something.
		    console.log('update successful');
		    connection.collection('cart'+payload._id).aggregate([{$lookup:{from:'advertisements',localField:'itemno',foreignField:'_id',as:'ad_info'}},{$unwind:'$ad_info'},{$project:{itemno:1,quantityselected:1,userid:1,ad_info:1,'cmp_val':{$cmp:['$ad_info.qualtity','$quantityselected']}}},{$match:{cmp_val:{'$lte':0}}}]).toArray(function (err, result) {
		      console.log('inside query');
		      if (err) {
				  console.log(err);
				  res.code = 500;
				  res.value = err;
				  callback(null, res);
				  return;
				}

		      var objToSend = new Object;
		      objToSend.cartItems = result;
		      var i = 0, total = 0;
		      for(i = 0; i < result.length; i++)
		      {
		        total = total + (result[i].quantityselected * result[i].ad_info.itemprice)
		      }
		      objToSend.carttotal = total;
		      console.log(JSON.toString(result));
		      res.code = 200;
		  	  res.objToSend = objToSend;
		  	  callback(null, res); 
		      
		    });

		  });
	};
	exports.addBid = function(payload,callback)
	{
		  var res = {};
		  var netPrice = parseFloat(payload.body.itemprice) + parseFloat(payload.body.bid);
		  var quantity = parseInt(payload.body.quantitySelected)+1;
		  var connection = connectionpool.getdbconnection();
		  
		  //connection.collection('bid').update({itemno:new ObjectID(req.body.itemid)}, {$set:{bids:{$each:[{userid:new ObjectID(req.session._id),bidplaced:netPrice,quantityselected:quantity}],$sort:{bidplaced:-1}}}},{upsert:true}, function(err, result) {
		  connection.collection('bid').update({itemno:new ObjectID(payload.body.itemid),'bids.userid':new ObjectID(payload._id)}, {$set:{'bids.$':{userid:new ObjectID(payload._id),bidplaced:netPrice,quantityselected:quantity}}}, function(err, result) {
		  if (err) {
			  console.log(err);
			  res.code = 500;
			  res.value = err;
			  callback(null, res);
			  return;
			}
		  //var test = result;
		  console.log('result:'+JSON.stringify(result) + result.result.nModified);
		  if(result.result.nModified == 0)
		  {
		    connection.collection('bid').update({itemno:new ObjectID(payload.body.itemid)}, {$push:{bids:{$each:[{userid:new ObjectID(payload._id),bidplaced:netPrice,quantityselected:quantity}],$sort:{bidplaced:-1}}}}, {upsert:true},function(err, result) {
		      console.log('bid updated for first time:'+result)
		      if (err) {
		    	  console.log(err);
		    	  res.code = 500;
		    	  res.value = err;
		    	  callback(null, res);
		    	  return;
		      }
		      bidlog.info('bid placed by ', req.session._id, ' performed at ', new Date().toJSON(), ' for item ',payload.body.itemid, ' amount ',netPrice);
		      res.code = 200;
		  	  //res.objToSend = objToSend;
		  	  callback(null, res); 
		    });
		  }
		  else
		  {
			  bidlog.info('bid placed by ', req.session._id, ' performed at ', new Date().toJSON(), ' for item ',payload.body.itemid, ' amount ',netPrice);
			  res.code = 200;
		  	  //res.objToSend = objToSend;
		  	  callback(null, res); 
		  }
		  //do something.

		  });
	};
	exports.onUserHandle = function(payload,callback)
	{
	  var res = {};
	  var url_parts = url.parse(payload.url);
	  var connection = connectionpool.getdbconnection();
	    connection.collection('ebayusers').find({ebayhandle:url_parts.pathname.substring(1,url_parts.pathname.length)}).toArray(function (err, rows) {
	      if (!err)
	      {
	        console.log('The solution is: '+ rows.length + ' ' + JSON.stringify(rows[0]));
	        if(rows.length == 0){
	        	 res.code = 500;
			  	  //res.objToSend = {email:rows[0].email,firstname:rows[0].firstname, lastname:rows[0].lastname, logintime:rows[0].logintime, phonenumber:rows[0].phonenumber,address:rows[0].address,birthdate:rows[0].birthdate};
			  	  callback(null, res); 
	          //res.render('error',{});
			  	  return;	
	        }
	        else
	        {
	        	 res.code = 200;
			  	 res.objToSend = {email:rows[0].email,firstname:rows[0].firstname, lastname:rows[0].lastname, logintime:rows[0].logintime, phonenumber:rows[0].phonenumber,address:rows[0].address,birthdate:rows[0].birthdate};
			  	 callback(null, res); 
	        }
	       
	      }
	      else
	      {
	    	  res.code = 500;
		  	  callback(null, res); 
	      }
	    });
	};