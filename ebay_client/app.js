var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes');
var passport = require('passport');
var expressSessions = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSessions);
var mongoSessionURL = "mongodb://localhost:27017/login";

var login = require('./routes/login'),
navigate = require('./routes/navigate'),
user = require('./routes/users'),
pay = require('./routes/payment'),
url  = require('url'),
mq_client = require('./rpc/client');;

require('./routes/passport')(passport);


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSessions({
	  secret: "CMPE273_EbayV2",
	  resave: false,
	  saveUninitialized: false,
	  duration: 30 * 60 * 1000,
	  activeDuration: 5 * 6 * 1000,
	  store: new mongoStore({
	    url: mongoSessionURL
	  })
	}));

app.post('/logout', function(req,res) {
	  req.session.destroy();
	  res.redirect('/');
	});
app.get('/logout', function(req,res) {
  req.session.destroy();
  res.redirect('/');
});

app.get('/userprofile',isAuthenticated,navigate.userprofile);
app.get('/postad',isAuthenticated,navigate.postad);
app.get('/cart',isAuthenticated,navigate.cart);
app.get('/userhistory',isAuthenticated,navigate.userhistory);
app.get('/getUserHistory',isAuthenticated,user.getUserHistory);
app.get('/getCart',isAuthenticated,user.getCart);
app.get('/getad',user.getad);
app.get('/getUserInfo',isAuthenticated,user.getUserInfo);
app.post('/updateSingleUserVal', user.updateSingleUserVal);
app.post('/postad',user.postad);
app.post('/addToCart',user.addToCart);
app.post('/removeFromCart',user.removeFromCart);
app.post('/addBid', user.addBid);
app.post('/checkout',pay.checkout);
app.get('/onPayment',isAuthenticated, pay.onPayment);
app.post('/onPayment', pay.onPayment);
app.post('/changeCartQuantity',user.changeCartQuantity);
app.get('/getcartvolume',user.getcartvolume);
app.get('/getUserName',isAuthenticated,login.getUserName);	
	
app.use(passport.initialize());
app.get('/', routes.index);

app.post('/login', login.verify(passport));
app.post('/signup', login.signup(passport));

app.use(function(req, res, next) {

    var msg_payload = {};
    msg_payload.url = req.url;
    mq_client.make_request('userhandle_queue',msg_payload, function(err,results){		

		if(err){
			return done(err);
		}
		else 
		{
			
			if(results.code == 200){
				console.log('response from server');
				// res.send(results.value);
				res.render('ebayhandlepage',results.objToSend); 
			}
			else {    
				console.log(results.value);
				res.status(500).send('Invalid path');
				 
			}
		}  
	});

});
 	

function isAuthenticated(req, res, next) {
	  if(req.session.user) {
	     console.log(req.session.user);
	     return next();
	  }
	  //res.redirect('/');
	  res.render('signin',{ err: '' });
	};

	
//app.get('/success_login', home.success_login);
//app.get('/fail_login', home.fail_login);
//app.post('/logout', home.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

