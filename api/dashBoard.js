var express = require('express');
var router = express.Router();
// var redeemCode = require('../models/redeemCode');
var Contact = require('../models/contact');
var auth = require("../middleware/auth");

router.get('/dashBoardAllCustomers', auth.requiresAdmin, function(req, res) {
    Contact.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/redemption_data', auth.requiresAdmin, function(req, res) {
    Contact.find({ reddeemed_date: { $gte: req.body.start_date, $lt: req.body.end_date, }, CodeRedeemFlag: true }, { "name": 1, "lastName": 1, "reddeemed_date": 1 }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})
module.exports = router;