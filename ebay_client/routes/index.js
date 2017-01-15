
/*
 * GET home page.
 */

exports.index = function(req, res){
	  if(req.session.user)
	    res.render('dashboard', {});
	  else
	    res.render('signin', { err: '' });
};