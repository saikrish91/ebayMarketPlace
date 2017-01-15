
var log = require('./logger');
exports.userprofile = function(req,res)
{
	log.info('user profile clicked ', req.session.id, ' performed at ', new Date().toJSON());
	res.render('userprofile',{ err: '' });
};

exports.postad = function(req,res)
{
	log.info('post ad clicked ', req.session.id, ' performed at ', new Date().toJSON());
	res.render('postad',{ err: '' });
};

exports.cart = function(req,res)
{
	log.info('view cart clicked ', req.session.id, ' performed at ', new Date().toJSON());
	res.render('cart',{ err: '' });
};

exports.userhistory = function(req,res)
{
	log.info('user history clicked ', req.session.id, ' performed at ', new Date().toJSON());
	res.render('userhistory',{ err: '' });
};