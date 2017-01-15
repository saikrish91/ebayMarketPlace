var log = require('./logger');
var mq_client = require('../rpc/client');
function check_card_num(cardnum) {

	if (/[^0-9-\s]+/.test(cardnum))
		return false;

	var ncPointer = 0, ndPointer = 0, isEvenPos = false;
	cardnum = cardnum.replace(/\D/g, "");

	for (var n = cardnum.length - 1; n >= 0; n--) {
		var cDigit = cardnum.charAt(n), ndPointer = parseInt(cDigit, 10);

		if (isEvenPos) {
			if ((ndPointer *= 2) > 9)
				ndPointer -= 9;
		}

		ncPointer += ndPointer;
		isEvenPos = !isEvenPos;
	}
	return (ncPointer % 10) == 0;
}
function valid_year(month, year) {
	return ((month != 'Month') && (parseInt(year) > 16));
}
function valid_name(name) {
	console.log('name length ' + name.length);
	return ((name.length != 0));
}
function valid_cvv(cvv) {
	var reg = new RegExp('^[0-9]+$');
	if (/[^0-9\s]+/.test(cvv))
		return false;
	console.log('cvv length is ' + cvv.length);
	return (cvv.length == 3);
}

exports.onPayment = function(req, res) {
	log.info('payment transaction ', req.session.id, ' performed at ',
			new Date().toJSON());
	console.log(req.body.cardholdername);
	console.log(req.body.cardnumber);
	console.log(req.body.expirymonth);
	console.log(req.body.expiryyear);
	console.log(req.body.test);
	var isValidCreditCardNum = check_card_num(req.body.cardnumber);
	var cardNumPrompt = '';
	if (!isValidCreditCardNum)
		cardNumPrompt = 'Invalid card number';
	var isValidYear = valid_year(req.body.expirymonth, req.body.expiryyear);
	var cardValidYEaPrompt = '';
	if (!isValidYear)
		cardValidYEaPrompt = 'Invalid year';
	var isValidName = valid_name(req.body.cardholdername);
	var cardValidNAme = '';
	if (!isValidName)
		cardValidNAme = 'Invalid name';
	var isValidCVV = valid_cvv(req.body.cvv);
	var cardValidCVV = '';
	if (!isValidCVV)
		cardValidCVV = 'Invalid CVV';

	if (!isValidCVV || !isValidName || !isValidYear || !isValidCreditCardNum) {
		log.info('payment failed ', req.session.id, ' performed at ',
				new Date().toJSON());
		var prompt = {};
		prompt.title = "Credit Card Info";
		prompt.cardnameerr = cardValidNAme;
		prompt.cardnumerr = cardNumPrompt;
		prompt.invaliddate = cardValidYEaPrompt;
		prompt.invalidcvv = cardValidCVV;
		res.render('checkout', prompt);
	} else {
		log.info('payment successful ', req.session.id, ' performed at ',
				new Date().toJSON());
		// update in history table
		var payload = {};
		payload._id = req.session._id;
		payload.name = req.session.name;
		payload.bidding = req.body.bidding;
		mq_client.make_request('onpayment_queue', payload, function(err,
				results) {
			if (err) {
				// return done(err);
				console.log(err);
			} else {

				if (results.code == 200) {
					console.log('payment successful');
					res.render('dashboard', {
						err : ''
					});

				} else {
					console.log(results.objToSend);
					res.render('dashboard', {
						err : 'Payment failure..'
					});
				}
			}
		});
	}
};
exports.checkout = function(req, res) {
	res.render('checkout', {
		title : 'Credit Card Info',
		cardnameerr : '',
		cardnumerr : '',
		invaliddate : '',
		invalidcvv : ''
	});
}