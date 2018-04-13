var express = require('express');
var router = express.Router();
var stripe = require('stripe')('sk_test_43l781B2lemmqcwCbHvmj15D');

router.post('', function(req, res) {

});

router.post('/stripe_payment', function(req, res) {
    var token = req.body.stripeToken;
    var charge = stripe.charges.create({
        amount: req.body.amount * 100,
        currency: req.body.currency,
        description: req.body.description,
        source: token,
    }, function(err, charge) {
        if (err) {
            res.status(400).json({ error: 1, message: "error occured", err: err })
        } else {
            console.log('success payment');
            res.status(200).json({ error: 0, charges: charge })
        }
    });
});

module.exports = router;