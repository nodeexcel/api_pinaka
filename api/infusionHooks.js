var express = require('express');
var router = express.Router();
var request = require('request');
var Interest = require('../models/interest');
var infusion_session = require("../models/infusion_session")
var Contact = require('../models/contact');
var config = require('../config')
var redeemCode = require('../models/redeemCode');


router.post('/HookAddCustomer', function(req, res) {
    infusion_session.findOne().then((token) => {
        var requestObj = {
            url: `https://api.infusionsoft.com/crm/rest/v1/contacts/${req.body.object_keys[0].id}?optional_properties=custom_fields&access_token=${token.access_token}`,
            method: "get",
        }
        request(requestObj, function(err, exist_check) {
            var obj = JSON.parse(exist_check.body);

            var contact = new Contact;
            if (obj.email_addresses[0].email) {
                contact.email = obj.email_addresses[0].email
            }
            if (obj.given_name) {
                contact.name = obj.given_name;
            }
            if (obj.family_name) {
                contact.lastName = obj.family_name;
            }
            if (obj.phone_numbers.length != 0) {
                contact.phone = obj.phone_numbers[0].number.replace(/[^A-Z0-9]/ig, "");
            }
            Contact.findOne({ phone: contact.phone }).then((data) => {
                if (!data) {
                    var requestInterestsArray = [];
                    for (var k in obj.custom_fields) {
                        if (obj.custom_fields[k].id == 22 && obj.custom_fields[k].content) {
                            requestInterestsArray = obj.custom_fields[k].content.split(",");
                        }
                    }
                    Interest.find({}, function(err, interests) {
                        var interestsTextArrayForInfusion = [];
                        if (requestInterestsArray.length > 0 && interests.length > 0) {
                            for (var i in interests) {
                                var iName = interests[i].name;
                                if (requestInterestsArray.indexOf(iName) > -1) {
                                    interestsTextArrayForInfusion.push({
                                        id: interests[i]._id,
                                    })
                                }
                            }
                        }
                        contact.interests = interestsTextArrayForInfusion;

                        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                        var redeem_code = '';
                        for (var i = 0; i < 4; i++) {
                            redeem_code += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        var textiData = {
                            "API_KEY_ID": "3d45188481ed352ba78bbbd3630f082b",
                            "mobileNum": 9713034142,
                            "shortcode": 345345,
                            "keyword": "PINAKA",
                            "message": redeem_code
                        }
                        var textiRequestObj = {
                            url: `https://textiful.com/api/v1/message`,
                            method: "post",
                            headers: {
                                'Authorization': config.textiAuthorization,
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            json: true,
                            form: textiData
                        }
                        var redeemCodeData = {
                            "redeem_code": redeem_code,
                            "type": "General"
                        }
                        request(textiRequestObj, function(err, response) {
                            if (err) {
                                res.status(400).json({ error: 1, message: "error occured", err: err })
                            } else {
                                if (response.statusCode == 200) {
                                    console.log("message sent to user with redeem code", redeem_code)
                                    redeemCode.update({ active_status: "Active", type: "General" }, { active_status: "InActive" }).then((resp) => {
                                        redeemCode.create(redeemCodeData).then((data) => {
                                            contact.save(function(err, data) {
                                                if (err) {
                                                    res.status(400).json({ error: 1, message: "error occured", err: err })
                                                } else {
                                                    console.log(data)
                                                }
                                            });
                                            res.json({ status: 1, message: "redeem code added", data: data })
                                        }, (err) => {
                                            res.status(400).json({ error: 1, message: "error occured", err: err })
                                        })
                                    }, (err) => {
                                        res.status(400).json({ error: 1, message: "error occured", err: err })
                                    })
                                }
                            }

                        })
                    })
                } else {
                    res.status(400).json({ error: 1, message: "number alreaady exist" })
                }
            })
        })
    })
})


module.exports = router;