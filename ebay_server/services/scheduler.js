var CronJob = require('cron').CronJob;
var connectionpool = require('./connectionpool');
var bidlog = require('./bidlogger');
var ObjectID = require('mongodb').ObjectID;

function updateBidToUserHistory(detail,connection)
{
	connection.collection('userhistory'+detail.userid).insertOne(detail,function(err, result) {
		if(err) {
			throw err;
		}
	});
}
var job = new CronJob('30 * * * * *', function() {

	console.log("test");
	var someDate = new Date();
	var numberOfDaysToAdd = -4;
	someDate.setDate(someDate.getDate() + numberOfDaysToAdd)
	var twentyMinutesLater = new Date();
	twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() - 2);
	console.log(twentyMinutesLater.toString());
	
	//select bids from ad which expired
	//for each bid expired
		//sort bids from users
		//pick users won
		//update  user history
	//remove the bids
	//remove the ad
	var connection = connectionpool.getdbconnection();
	connection.collection('advertisements').find({dateposted:{$lte:twentyMinutesLater},bidding:'true'}).toArray(function (err, result) {
		console.log('inside query');
		if (err) {
			console.log(err);
			throw err;
		} 

		for(var r in result)
		{
			var quantity = result[r].quantity;
			connection.collection('bid').update({itemno:new ObjectID(result[r]._id)}, {$push:{bids:{$each:[],$sort:{bidplaced:-1}}}}, (function(quantity_snapshot,row_snaphot){console.log("[7]"); return function(err, result) {
				if (err)
				{
					throw err;
				}
				//do something.
				connection.collection('bid').find({itemno:new ObjectID(row_snaphot._id)}).toArray(function (err, bidresult) {
					console.log(JSON.stringify(bidresult[0]));
					if(err)
						throw err;
					else if(bidresult.length > 0)
					{
						var bids = bidresult[0].bids;
						
						var deleteflag = false;
						for(var bid in bids) {
							console.log('[5] ' + quantity_snapshot);
	
							if (bids[bid].quantityselected <= quantity_snapshot) {
								console.log('[6]');
								var post = new Object();
								//post.itemno = row_snaphot.itemno;
								post.itemname = row_snaphot.itemname;
								post.itemdescription = row_snaphot.itemdescription;
								post.transactiontype = 'Bought';
								post.sellerinformation = row_snaphot.sellerinformation;
								post.quantity = parseInt(bids[bid].quantityselected);
								post.itemprice = parseFloat(bids[bid].bidplaced);
								//post.bidding = req.body.bidding;
								//post.email = null;
								post.userid = bids[bid].userid;
								post.dateposted = new Date();
								bidlog.info('bid won by ', post.userid, ' performed at ', new Date().toJSON(), ' for item ', post.itemno, ' amount placed ', post.itemprice, ' quantity selected ', post.quantity);
								//update to user history'
								updateBidToUserHistory(post,connection);
	
								if (deleteflag == false) {
									connection.collection('bid').remove({itemno:new ObjectID(row_snaphot._id)}, function(err, result) {
										if (err) {
											console.log(err);
										}
									});
									connection.collection('advertisements').remove({_id: new ObjectID(row_snaphot._id)}, function(err, result) {
										if (err) {
											console.log(err);
										}
									});
									deleteflag = true;
								}
								quantity_snapshot = quantity_snapshot - bids[bid].quantityselected;
							}
							else
								bidlog.info('bid lost by ', bids[bid].userid, ' performed at ', new Date().toJSON(), ' for item ', row_snaphot.itemno, ' amount placed ', bids[bid].bidplaced, ' quantity selected ', bids[bid].quantityselected);
						}
					}
					else
					{
						//get executes when there is no bid placed
						connection.collection('advertisements').remove({_id: new ObjectID(row_snaphot._id)}, function(err, result) {
							if (err) {
								console.log(err);
							}
						});
					}
				});

			}})(quantity,result[r]));
		}
	});
}, null, true, 'America/Los_Angeles');
