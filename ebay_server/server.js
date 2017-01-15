
var amqp = require('amqp')
, util = require('util');

var login = require('./services/login');
var users = require('./services/users');
var scheduler = require('./services/scheduler');
var payment = require('./services/payment');
var connectionpool = require('./services/connectionpool');
var cnn = amqp.createConnection({host:'127.0.0.1'});
process.on('SIGINT', function() {
	connectionpool.closedbconnection();
	});
process.on('close', function() {
	connectionpool.closedbconnection();
	});
cnn.on('ready', function(){
	console.log("listening on login_queue");
	cnn.queue('login_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
		
			login.handle_request(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});

	cnn.queue('register_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
		
			login.handle_signup(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	cnn.queue('getad_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('get ad ' + JSON.toString(message));
			users.handle_getad(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	cnn.queue('addtocart_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('addtocart_queue' + JSON.toString(message));
			users.handle_addtocart(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	
	cnn.queue('getcart_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('handle_getcart' + JSON.toString(message));
			users.handle_getcart(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	cnn.queue('removefromcart_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('handle_removefromcart' + JSON.toString(message));
			users.handle_removefromcart(message, function(err,res){

				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	cnn.queue('getcartvolume_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('handle_getcartvolume' + JSON.toString(message));
			users.handle_getcartvolume(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
	cnn.queue('getuserhistory_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('getUserHistory' + JSON.toString(message));
			users.getUserHistory(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
    cnn.queue('updatesingleuserval_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('updateSingleUserVal' + JSON.toString(message));
			users.updateSingleUserVal(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('getuserinfo_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('getuserinfo_queue' + JSON.toString(message));
			users.getUserInfo(message, function(err,res){

				//return index sent
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('postad_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('postad_queue' + JSON.toString(message));
			users.postad(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('changecartquantity_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('changecartquantity_queue' + JSON.toString(message));
			users.changeCartQuantity(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('addbid_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('addbid_queue' + JSON.toString(message));
			users.addBid(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('onpayment_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('onpayment_queue' + JSON.toString(message));
			payment.onPayment(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
 cnn.queue('userhandle_queue', function(q){
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log('userhandle_queue' + JSON.toString(message));
			users.onUserHandle(message, function(err,res){
				cnn.publish(m.replyTo, res, {
					contentType:'application/json',
					contentEncoding:'utf-8',
					correlationId:m.correlationId
				});
			});
		});
	});
});