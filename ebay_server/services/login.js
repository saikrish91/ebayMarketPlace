var mongo = require('./mongo');
var connectionpool = require('./connectionpool');
var bcrypt   = require('bcrypt-nodejs');

function handle_request(msg, callback){

	var res = {};
	console.log("In handle request:"+ msg.username);
	var connection = connectionpool.getdbconnection();
	var coll = connection.collection('ebayusers');
	coll.findOne({email:msg.username}, function (err, result) {
		if (err) 
		{
			console.error("Can't insert" + err);
		}
		
		if(result)
		{
			if(!validPassword(msg.password,result.password))
			{
				console.log("else loop");
				res.code = 401;
				res.value = "Login Failed";
				callback(null, res);
				return;
			}
			coll.updateOne(
            { "email" : msg.username },
            {
                $set: { "logintime": new Date().toDateString() },
                $currentDate: { "lastModified": true }
            }, function(err, results) {
                console.log(results);
                //connection.close();
            });

			//console.log(JSON.stringify(result));
	
		        
			res.code = 200;
			res.value = "Login Success";
			res.firstname = result.firstname;
			res.lastname = result.lastname;
			console.log(res.username);
			res.name = result.firstname + " " + result.lastname;
			console.log(res.name);
			res._id  = result._id;
			res.user = result.firstname + result.lastname;
			res.logintime = result.logintime;
			//console.log(res.lname);
			
		}else {
			console.log("else loop");
			res.code = 401;
			res.value = "Login Failed";
		}
		console.log("Before the call back");
		callback(null, res);
	});
	

}

function handle_signup(msg, callback){

	var res = {};
	console.log("In handle signup:"+ JSON.stringify(msg));

    var whereParams = {
            email:msg.email
        }
    var connection = connectionpool.getdbconnection();
	var loginCollection = connection.collection('ebayusers');
        loginCollection.findOne(whereParams, function(error, user) {

            if(error) {
                //return done(err);
            	res.code = 401;
    			res.value = "Registration Failure";
    			callback(null, res);
            }

            if (user) {
            	res.code = 401;
    			res.value = "Registration Failure";
    			callback(null, res);
            }
            else
            {
            	var hashPassword = generateHash(msg.password);
                var post  = {firstname: msg.firstname, lastname:msg.lastname,email:msg.email,password:hashPassword,logintime:new Date().toDateString()};

                console.log("post message" + post);
                loginCollection.insertOne(post, function(err, result) {
                    if(err) {
                    	res.code = 401;
            			res.value = "Registration Failure";
            			callback(null, res);
                    }
                    res.code = 200;
        			res.value = "Registration Success";
        			callback(null, res);
                 });
            }         
        });
}

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
function validPassword(password,userpassword) {
	console.log('Valid password');
    return bcrypt.compareSync(password, userpassword);
};

exports.handle_signup = handle_signup;
exports.handle_request = handle_request;