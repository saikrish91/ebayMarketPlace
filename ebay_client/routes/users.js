var log = require('./logger');
var mq_client = require('../rpc/client');
exports.getad = function(req, res) {
  log.info('getad ', req.session._id, ' performed at ', new Date().toJSON());
  console.log('get_ad');
  	var msg_payload = {userid:req.session._id};
  	console.log(msg_payload);
	mq_client.make_request('getad_queue',msg_payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				 res.send(results.value);
		
			}
			else {    
				console.log(results.value);
				 
			}
		}  
	});
};

exports.addToCart = function(req, res){
  log.info('item added to cart ', req.session._id, ' performed at ', new Date().toJSON(),' item no ',req.body.itemid);
  console.log(req.body);
  var payload = new Object();
  payload.itemno = req.body.itemid;
  payload.quantityselected = parseInt(req.body.quantitySelected)+1;;
  payload.userid = req.session._id;

  mq_client.make_request('addtocart_queue',payload, function(err,results){		

		if(err){
			return done(err);
		}
		else 
		{			
			if(results.code == 200){
				console.log('success ful response from server');
				res.render("cart",{});
		
			}
			else {    
				res.render("cart",{err:'Not able to add the item'});
				console.log(results.value);
				 
			}
		}  
	});
};

exports.getCart = function(req, res) {
  log.info('Cart viewed ', req.session._id, ' performed at ', new Date().toJSON());
  var payload = new Object();  
  payload._id = req.session._id;
  mq_client.make_request('getcart_queue',payload, function(err,results){		
		if(err){
			throw err;
		}
		else 
		{			
			if(results.code == 200){
				console.log('response from server');
				 res.send(results.objToSend);		
			}
			else {
				res.status(404).send('not able to fetwch the cart');
				console.log(results.objToSend);				 
			}
		}  
	});
}
exports.removeFromCart = function(req,res){
  log.info('item removed from cart ', req.session._id, ' performed at ', new Date().toJSON(),' item no ',req.body.itemno);
  console.log(req.body.itemno + " " +typeof req.body.itemno );
  var payload = new Object();
  payload.itemno = req.body.itemno;
  payload._id = req.session._id;
  mq_client.make_request('removefromcart_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{			
			if(results.code == 200){
				console.log('response from server');
				 res.send(results.objToSend);
		
			}
			else {    
				res.status(404).send("object was not removed");
				console.log(results.objToSend);
				 
			}
		}  
	});
};
exports.getcartvolume = function(req, res){
  log.info('getcartvolume ', req.session.id, ' performed at ', new Date().toJSON());
  var payload = new Object();
 
  payload._id = req.session._id;
  mq_client.make_request('getcartvolume_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				 res.send(results.objToSend);
		
			}
			else {    
				console.log(results.objToSend);
				 res.send
			}
		}  
	});
 
};
exports.getUserHistory = function(req, res){
  log.info('User history view ', req.session.id, ' performed at ', new Date().toJSON());
  var payload = new Object();
  
  payload._id = req.session._id;
  mq_client.make_request('getuserhistory_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				 res.send(results.objToSend);
		
			}
			else {    
				console.log(results.objToSend);
				 
			}
		}  
	});
};
exports.updateSingleUserVal = function(req,res){
  log.info('updateSingleUserVal done by ', req.session.id, ' performed at ', new Date().toJSON(),' cart item no ',req.body.cartNo);
  console.log(req.body);
  var payload = new Object();
  
  payload._id = req.session._id;
  payload.data = req.body.data;
  payload.value = req.body.value;
  
  mq_client.make_request('updatesingleuserval_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				// res.send(results.objToSend);
		
			}
			else {    
				console.log(results.objToSend);
				 
			}
		}  
	});
  // res.send("success");
};
exports.getUserInfo = function(req, res){
  log.info('get user info ', req.session.id, ' performed at ', new Date().toJSON());
  console.log(req.body);
  
  var payload = new Object();
  
  payload._id = req.session._id;
  payload.data = req.body.data;
  payload.value = req.body.value;
  mq_client.make_request('getuserinfo_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				res.send(results.objToSend);
		
			}
			else {    
				console.log(results.objToSend);
				 
			}
		}  
	});
};

exports.postad = function(req, res) {
  console.log(req.body);
  var post = new Object();
  post.itemname = req.body.itemname;
  post.itemdescription = req.body.itemdescription;
  post.sellerinformation = req.session.name ;
  post.itemprice = parseFloat(req.body.itemprice);
  post.quantity = parseInt(req.body.quantity);
  post.bidding = req.body.bidding;
  post.userid = req.session._id;
  post.dateposted = new Date();
  console.log(JSON.stringify(post));
  mq_client.make_request('postad_queue',post, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				res.render("dashboard",{});
		
			}
			else {    
				console.log(results.objToSend);
				 
			}
		}  
	});

}
exports.changeCartQuantity = function(req,res){
  log.info('Cart Quantity Changed by ', req.session.id, ' performed at ', new Date().toJSON(),' cart item no ',req.body.cartNo);
  console.log(req.body.changedQuantity + ' ' +req.body.cartNo);
  var payload = new Object();
  payload.changedQuantity = req.body.changedQuantity;
  payload.cartNo = req.body.cartNo;
  payload._id = req.session._id;
  
  mq_client.make_request('changecartquantity_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				res.send(results.objToSend);
		
			}
			else {    
				console.log(results);
				 
			}
		}  
	});
};
exports.addBid = function(req, res){
  log.info('addbid ', req.session.id, ' performed at ', new Date().toJSON());
  
  var payload = {};
  payload._id = req.session._id;
  payload.body = req.body;
  mq_client.make_request('addbid_queue',payload, function(err,results){		
		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				//res.send(results.objToSend);
		
			}
			else {    
				console.log(results);
				 
			}
		}  
	});
  res.render("dashboard",{});
};