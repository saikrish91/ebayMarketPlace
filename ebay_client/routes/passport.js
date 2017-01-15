var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt   = require('bcrypt-nodejs');
var mq_client = require('../rpc/client');

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(email, password, done) {  	
    	var username = email;
    	var password = password;
    	var msg_payload = { username: username,password:password };  		
    	mq_client.make_request('login_queue',msg_payload, function(err,results){
    		if(err){
    			return done(err);
    		}
    		else 
    		{  			
    			if(results.code == 200){
    				console.log('response from server'); 				
    				done(null, results);
    			}
    			else {    
    				console.log("Invalid Login");
    				return done(null, false);
    			}
    		}  
    	});
    }));
    passport.use('signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            var msg_payload  = {firstname: req.body.firstname, lastname:req.body.lastname,email:req.body.email,password:password,logintime:new Date().toDateString()};
        	mq_client.make_request('register_queue',msg_payload, function(err,results){   		        		
        		if(err){
        			return done(err);
        		}
        		else 
        		{
        			if(results.code == 200){
        				console.log('response from server');			
        				done(null, results);
        			}
        			else {    
        				console.log("Invalid signup... record duplication");
        				return done(null, false);
        			}
        		}  
        	});
        }));
}



