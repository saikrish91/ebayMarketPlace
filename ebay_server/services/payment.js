
var connectionpool = require('./connectionpool');
var ObjectID = require('mongodb').ObjectID;

exports.onPayment = function(payload,callback)
{
	console.log('onPay');
	var connection = connectionpool.getdbconnection();
	connection.collection('cart'+payload._id).aggregate([{$lookup:{from:'advertisements',localField:'itemno',foreignField:'_id',as:'ad_info'}},{$unwind:'$ad_info'},{$project:{itemno:1,quantityselected:1,userid:1,ad_info:1,'cmp_val':{$cmp:['$ad_info.qualtity','$quantityselected']}}},{$match:{cmp_val:{'$lte':0}}}]).forEach(function (i)  {
		console.log(JSON.stringify(i));
		var post = new Object();
		post.itemname = i.ad_info.itemname;
		post.itemdescription = i.ad_info.itemdescription;
		post.sellerinformation = i.ad_info.sellerinformation ;
		post.itemprice = parseFloat(i.ad_info.itemprice);
		post.quantity = parseInt(i.quantityselected);
		post.bidding = payload.bidding;
		//var ObjectID = require('mongodb');
		//var _id = new ObjectID(req.session.id.toString());
		post.userid = payload._id;
		post.dateposted = new Date();
		post.transactiontype = 'bought';
		connection.collection('userhistory'+payload._id).insertOne(post,function(err, result) {
			if(err) {
			  res.code = 500;
	    	  res.value = err;
	    	  callback(null, res);
	    	  return;
			}

		});
		connection.collection('advertisements').update({_id:new ObjectID(i.itemno)}, {$set:{quantity:i.ad_info.quantity - i.quantityselected}}, function(err, result) {
			if (err)
			{
			  res.code = 500;
	    	  res.value = err;
	    	  callback(null, res);
	    	  return;
			}
			console.log('update successful');
			var res = {};
			res.code = 200;
		    callback(null, res);  
			connection.collection('advertisements').remove({quantity:{$lte:0}}, function(err, result) {
			if (err) {
				 res.code = 500;
		    	 res.value = err;
		    	 callback(null, res);
		    	 return;
			}
			console.log(result);
			});
		});
		connection.collection('cart'+payload._id).remove({}, function(err, result) {
			if (err) {
				 res.code = 500;
		    	 res.value = err;
		    	 callback(null, res);
		    	 return;
			}

		});
	});
};