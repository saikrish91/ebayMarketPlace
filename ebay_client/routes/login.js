
var passport = require('passport');
require('./passport')(passport);

exports.login = function(req, res){
    res.render('successLogin', {user:{username: req.session.user}});
};

exports.verify = function(passport){
    return function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
        if(err) {
        	console.log(err);
            return next(err);
        }
        console.log("inside login");
        if(!user) {
            return res.render('signin',{err:'Invalid username or password'});
        }

        console.log(JSON.stringify(user));
        req.session.email = req.body.email;
        req.session.firstname = user.firstname;
        req.session.name  = user.firstname + " " + user.lastname;
        req.session._id  = user._id;
        req.session.user = user.firstname + user.lastname;
        req.session.logintime = user.logintime;
        console.log("session initialized  " + req.session.firstname + " "+req.session.lastname)
        return res.render('dashboard', {});

    })(req, res, next);
}};
// process the signup form
exports.signup = function(passport){
    return function(req, res, next) {
	    passport.authenticate('signup', function(err, user, info) {
	
	        if(err) {
	        	console.log(err);
	            return next(err);
	        }
	        console.log("inside login");
	        if(!user) {
	            return    res.render('signin',{ err: 'email already present... Try with another email' });
	        }
	        else
	        console.log(JSON.stringify(user));
	        return res.render('signin', {user:user,err:'username created successfully...Login using the username you created'});
	    })(req, res, next);
}};

exports.getUserName = function(req,res)
{
    var obj = {};
    console.log('get user name '+ obj.firstname + ' '+obj.logintime);
    obj.firstname = req.session.firstname;
    obj.logintime = req.session.logintime;
    res.send(obj);

};