var ejs = require("ejs");
var mq_client = require('../rpc/client');
var session = require('express-session');


function sign_in(req,res) {

	ejs.renderFile('./views/signin.ejs',function(err, result) {
	   // render on success
	   if (!err) {
	            res.end(result);
	   }
	   // render or error
	   else {
	            res.end('An error occurred');
	            console.log(err);
	   }
   });
}

function signup(req,res) {

	ejs.renderFile('./views/register.ejs',function(err, result) {
		// render on success
		if (!err) {
			res.send(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

function register(req, res) {
	var fname = req.param("fname");
	var lname = req.param("lname");
	var username = req.param("registeremail");
	var password = req.param("pass");

	var msg_payload = {"username": username, "password":password, "fname":fname, "lname":lname};

	console.log("inside register post" + JSON.stringify(msg_payload));

	mq_client.make_request('register_queue', msg_payload, function (err, results) {
		console.log(results);
		if(err){
			throw err;
		}
		else
		{
			if(results.code == 200){
				console.log("register success");

				res.redirect('/signin');
			}
			else {

				console.log("register fail");
				res.redirect('/register');
			}
		}
	});
};

function after_sign_in(req,res, next)
{
	// check user already exists
	//var getUser="select * from users where emailid='"+req.param("username")+"'";
	var username = req.param("username");
	var password = req.param("password");
	var msg_payload = { username: username, password: password };
		
	console.log("In POST Request = UserName:"+ username+" "+password);
	
	mq_client.make_request('login_queue',msg_payload, function(err,results){
		

		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				req.session.username = results.username;
				req.session.fname = results.fname;
				req.session.lname = results.lname;
				// res.redirect("/successLogin");
				res.send({"login":"Success"});
			}
			else {    
				
				console.log("Invalid Login");
				// res.redirect("/fail_login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
}
function success_login(req,res)
{
	var obj = new Object();
	var fname = req.session.fname;
	console.log(fname);
	var lname = req.session.lname;
	console.log(lname);
	var email = req.session.username;
	ejs.renderFile('./views/success_login.ejs',{fname: fname, lname: lname, email: email}, function(err, result) {
        // render on success
        if (!err) {
			//console.log(JSON.stringify(result));
            res.send(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
    });
}


function fail_login(req,res)
{
	ejs.renderFile('./views/fail_login.ejs',function(err, result) {
        // render on success
        if (!err) {
            res.end(result);
        }
        // render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
    });
}

function logout(req, res){
	req.session.destroy();
	res.redirect('/signin');
}


exports.sign_in=sign_in;
exports.signup = signup;
exports.register = register;
exports.after_sign_in=after_sign_in;
exports.success_login=success_login;
exports.fail_login=fail_login;
exports.logout = logout;