var express = require('express');
var router = express.Router();
var errorCode = require('../constants/errorcode');
var Contact = require('../models/contact');
var redeemCode = require('../models/redeemCode');
var errorCode = require('../constants/errorcode');
var auth = require("../middleware/auth");

router.post('/AddRedeemCode', function(req, res) {
    if (req.body.redeem_code == null || req.body.redeem_code == "") {
        res.status(400).json({ error: 1, message: "redeem code can not be empty" });
    } else {
        if (req.body.type == "Universal") {
            redeemCode.findOne({ type: req.body.type }).then((data) => {
                if (data) {
                    res.json({ error: 1, message: "can not add more then one universal code" })
                } else {
                    redeemCode.create(req.body).then((data) => {
                        res.json({ status: 1, data: data })
                    }, (err) => {
                        res.status(400).json({ error: 1, message: "error occured", err: err })
                    })
                }
            })
        } else {
            redeemCode.findOne({ redeem_code: req.body.redeem_code }).then((data) => {
                if (!data) {
                    redeemCode.create(req.body).then((data) => {
                        res.json({ status: 1, message: "redeem code added", data: data })
                    }, (err) => {
                        res.status(400).json({ error: 1, message: "error occured", err: err })
                    })
                } else {
                    res.status(400).json({ status: 1, message: "redeem code already exist" })
                }

            })
        }
    }
})

router.get('/getAllRedeemCode', function(req, res) {
    redeemCode.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.put('/updateRedeemCode', function(req, res) {
    if (req.body.redeem_code == null || req.body.redeem_code == "") {
        res.status(400).json({ error: 1, message: "redeem_code can not be empty" });
    } else if (req.body.type == null || req.body.type == "") {
        res.status(400).json({ error: 1, message: "type can not be empty" });
    } else {
        redeemCode.update({ _id: req.body._id }, body).then((data) => {
            res.json({ status: 1, message: "redeem code updated", data: data })
        }, (err) => {
            res.status(400).json({ error: 1, message: "error occured", err: err })
        })
    }
})

router.delete('/deleteRedeemCode', function(req, res) {
    redeemCode.remove({ _id: req.body._id }, body).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

module.exports = router;