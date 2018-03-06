var express = require('express');
var router = express.Router();
var errorCode = require('../constants/errorcode');
var Contact = require('../models/contact');
var Admin = require('../models/admin');
var md5 = require('md5');
var auth = require("../middleware/auth");
var jwt = require("jsonwebtoken");
var user_activity = require("../service/user_activity")
var infusion_service = require("../service/infusion_service")
var redeemCode = require('../models/redeemCode');
var admin_logs = require("../models/admin_logs")
var Interest = require('../models/interest');


router.post('/Adminlogin', function(req, res) {
    if (req.body.email == null || req.body.email == "") {
        res.status(400).json({ code: errorCode.login.EMPTYEMAIL });
    } else if (req.body.password == null || req.body.password == "") {
        res.status(400).json({ code: errorCode.login.EMPTYPASSWORD });
    } else {
        Admin.findOne({ email: req.body.email, password: md5(req.body.password) }).then((data) => {
            if (data) {
                var expiredIn = 0;
                if (req.body.remember_me) {
                    expiredIn = 24 * 60 * 60 * 30;
                } else {
                    expiredIn = 60 * 60;
                }
                const token = jwt.sign({
                    token: data._id,
                }, "secret_key", {
                    expiresIn: expiredIn,
                });
                Admin.update({ _id: data._id }, { $set: { lastLogin: new Date() } }).then((res) => {
                    console.log("logged in")
                })
                res.json({ status: 1, token: token, data: data });
            } else {
                res.status(400).json({ message: "invalid username or password" });
            }
        })
    }
})

router.post('/addAdminStaff', auth.requiresAdmin, function(req, res) {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (req.body.name == null || req.body.name == '') {
        res.status(400).json({ code: errorCode.signup.EMPTYNAME });
    } else if (req.body.email == null || req.body.email == '') {
        res.status(400).json({ code: errorCode.signup.EMPTYEMAIL });
    } else if (req.body.password == null || req.body.password == '') {
        res.status(400).json({ code: errorCode.signup.EMPTYPASS });
    } else if (req.body.role == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYROLE });
    } else if (!reg.test(req.body.email)) {
        res.status(400).json({ code: errorCode.signup.INVALIDEMAIL });
    } else {
        req.body.password = md5(req.body.password);
        var adminData = new Admin(req.body);
        Admin.findOne({ email: req.body.email }).then((data) => {
            if (!data) {
                adminData.save(function(err, data) {
                    if (err) {
                        res.json(err)
                    } else {
                        user_activity.userActivityLogs(req, data);
                        res.json({ status: 1, message: "user added", data: data })
                    }
                })
            } else {
                res.status(400).json({ error: 1, message: "email already exist" });
            }
        })
    }
})

router.get('/getAllAdminStaff', auth.requiresAdmin, function(req, res) {
    Admin.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.put('/updateAdminStaff', auth.requiresAdmin, function(req, res) {
    if (req.body.password) {
        req.body.password = md5(req.body.password)
    }
    Admin.update({ _id: req.body._id }, req.body).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.delete('/deleteAdminStaff', auth.requiresAdmin, function(req, res) {
    Admin.remove({ _id: req.body._id }).then((data) => {
        res.json({ status: 1, message: "deleted", data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/searchAdminStaff', auth.requiresAdmin, function(req, res) {
    Admin.find({ $or: [{ email: { '$regex': new RegExp(req.body.search, 'i') } }, { name: { '$regex': new RegExp(req.body.search, 'i') } }] }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/addCustomer', auth.requiresAdmin, function(req, res) {
    var name = req.body.name;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var sms_option = req.body.sms_option;
    var app_installed = req.body.app_installed
    var birthday = req.body.birthday;
    var zipcode = req.body.zipcode;
    var gender = req.body.gender;
    var marital = req.body.marital;
    var kids = req.body.kids;
    var password = req.body.password;
    var phone = req.body.phone;
    var interests = req.body.interests;
    var source = req.body.source;
    var type = req.body.type;
    var address1 = req.body.address1;
    var address2 = req.body.address2
    var city = req.body.city;
    var state = req.body.state;
    var redeem_code = req.body.redeemCode;
    var anniversary = req.body.anniversary;
    var occupation = req.body.occupation;

    //null validate
    if (name == null || name == '') {
        res.status(400).json({ code: errorCode.signup.EMPTYNAME });
    } else if (email == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYEMAIL });
    } else if (birthday == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYBIRTHDAY });
    } else if (zipcode == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYZIPCODE });
    } else if (gender == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYGENDER });
    } else if (marital == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYMARITAL });
    } else if (kids == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYKIDS });
    } else if (password == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYPASS });
    } else if (source == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYSOURCE });
    } else if (type == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYTYPE });
    } else if (interests == null) {
        res.status(400).json({ code: errorCode.signup.EMPTYINTEREST });
    } else {
        //remove trim
        name = name.trim();
        email = email.trim();
        birthday = birthday.trim();
        zipcode = zipcode.trim();
        if (phone) {
            phone = phone.trim();
        }

        //email, birthday, phone number, zipcode, gender, kids, marital, interest, type validate
        var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regZip = /^[0-9]{1,5}$/;
        var regPhone = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

        if (!reg.test(email)) {
            res.status(400).json({ code: errorCode.signup.INVALIDEMAIL });
        } else if (isNaN((new Date(birthday)).getTime())) {
            res.status(400).json({ code: errorCode.signup.INVALIDBIRTHDAY });
        } else if (!regZip.test(zipcode)) {
            res.status(400).json({ code: errorCode.signup.INVALIDZIPCODE });
        } else if (gender != '0' && gender != '1') {
            res.status(400).json({ code: errorCode.signup.INVALIDGENDER });
        } else if (marital != '0' && marital != '1') {
            res.status(400).json({ code: errorCode.signup.INVALIDMARITAL });
        } else if (kids != '0' && kids != '1') {
            res.status(400).json({ code: errorCode.signup.INVALIDKIDS });
        } else if (source != '0' && source != '1' && source != '2' && source != '3') {
            res.status(400).json({ code: errorCode.signup.INVALIDSOURCE });
        } else if (type != '0' && type != '1') {
            res.status(400).json({ code: errorCode.signup.INVALIDTYPE });
        } else {
            //existing email or phone validate
            var contact = new Contact;
            Contact.findOne({ $or: [{ email: email }, { phone: phone }] }, function(err, user) {
                if (user && user.email == email && email) {
                    res.status(400).json({ code: errorCode.signup.DUPLICATEEMAIL });
                } else if (user && user.phone == phone && phone) {
                    res.status(400).json({ code: errorCode.signup.DUPLICATEPHONE });
                } else {
                    if (redeem_code) {
                        redeemCode.findOne({ redeem_code: redeem_code }).then((data) => {
                            if (data) {
                                contact.CodeRedeemFlag = true;
                                contact.redeemCode = redeem_code;
                                contact.reddeemed_date = new Date();
                                customerObject(function(response) {
                                    res.json({ status: 1, data: response })
                                })
                            } else {
                                res.status(400).json({ error: 1, message: "redeem code does not exist" });
                            }
                        })
                    } else {
                        customerObject(function(response) {
                            res.json({ status: 1, data: response })
                        })
                    }
                }

                function customerObject(callback) {
                    contact.name = name;
                    contact.lastName = lastName;
                    contact.email = email;
                    contact.sms_option = sms_option;
                    contact.app_installed = app_installed;
                    contact.birthday = birthday;
                    contact.zipcode = zipcode;
                    contact.gender = gender;
                    contact.marital = marital;
                    contact.kids = kids;
                    contact.password = md5(password);
                    contact.created_at = new Date();
                    contact.updated_at = new Date();
                    contact.contact_source = source;
                    contact.type = type;
                    contact.city = city;
                    contact.state = state;
                    contact.type = type;
                    contact.address1 = address1;
                    contact.address2 = address2;
                    contact.occupation = occupation;
                    contact.anniversary = anniversary;
                    contact.createdBy = req.user.email;
                    contact.modifiedBy = req.user.email;
                    if (phone) {
                        contact.phone = phone;
                    }
                    if (interests != '') {
                        var interestDATA = [];
                        var interestsItems = interests.split(":");
                        for (var i = 0; i < interestsItems.length; i++) {
                            var temp = interestsItems[i].split(",");
                            interestDATA.push({
                                id: temp[0],
                                level: temp[1]
                            });
                        }
                        contact.interests = interestDATA;
                    }

                    contact.token = md5((contact.email | contact.phone) + contact.created_at);

                    // code added by arun on 1st march

                    Interest.find({}, function(err, interests) {
                        var interestsTextArrayForInfusion = [];
                        if (interests.length > 0) {
                            for (var i = 0; i < interests.length; i++) {
                                var i_id = interests[i]._id;
                                if (req.body.interests.indexOf(i_id) != -1) {
                                    interestsTextArrayForInfusion.push(interests[i].name)
                                }
                            }
                        }
                        infusion_service.createContact(req.body, interestsTextArrayForInfusion).then((infusion_data) => {
                            if (infusion_data.statusCode == 201) {
                                contact.infusion_id = infusion_data.body.id;
                                contact.save(function(err, data) {
                                    if (err) {
                                        res.status(400).json({ error: 1, message: "error occured", err: err })
                                    } else {
                                        user_activity.userActivityLogs(req, data);
                                        callback(data);
                                    }
                                });
                            } else {
                                res.json({ error: 1, message: "can not add on infusionsoft", data: infusion_data })
                            }
                        })
                    });
                }
            });
        }
    }
})

router.put('/updateCustomer', auth.requiresAdmin, function(req, res) {
    req.body.modifiedBy = req.user.email;
    if (req.body.interests) {
        var interestDATA = [];
        var interestsItems = req.body.interests.split(":");
        for (var i = 0; i < interestsItems.length; i++) {
            var temp = interestsItems[i].split(",");
            interestDATA.push({
                id: temp[0],
                level: temp[1]
            });
        }
    }
    req.body.interests = interestDATA;
    // updateCustomers(function(response) {
    //     res.json({ status: 1, message: "customer details updated", data: response })
    // })


    if (req.body.infusion_id) {
        Interest.find({}, function(err, interests) {
            var interestsTextArrayForInfusion = [];
            if (interests.length > 0) {
                for (var i = 0; i < interests.length; i++) {
                    var i_id = interests[i]._id;
                    if (req.body.interests.indexOf(i_id) != -1) {
                        interestsTextArrayForInfusion.push(interests[i].name)
                    }
                }
            }
            infusion_service.updateContact(req.body, interestsTextArrayForInfusion).then((infusion_data) => {
                if (infusion_data.statusCode == 200) {
                    updateCustomers(function(response) {
                        res.json({ status: 1, message: "customer details updated", data: response })
                    })
                } else {
                    res.json(infusion_data)
                }
            })
        })
    } else {
        updateCustomers(function(response) {
            res.json({ status: 1, message: "customer details updated", data: response })
        })
    }

    function updateCustomers(callback) {
        Contact.update({ _id: req.body._id }, req.body).then((data) => {
            user_activity.userActivityLogs(req, data);
            res.json({ status: 1, message: "customer details updated", data: data })
        }, (err) => {
            res.status(400).json({ error: 1, message: "error occured", err: err })
        })
    }
})

router.delete('/deleteCustomer', auth.requiresAdmin, function(req, res) {
    Contact.remove({ _id: req.body._id }).then((data) => {
        res.json({ status: 1, message: "customer deleted", data: data })
    }, (err) => {
        user_activity.userActivityLogs(req, data);
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.get('/getAllCustomer/:page', auth.requiresAdmin, function(req, res) {
    Contact.find({}).skip(req.params.page * 20).limit(20).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/search_allCustomers', auth.requiresAdmin, function(req, res) {
    Contact.find({ $or: [{ email: { '$regex': new RegExp(req.body.search, 'i') } }, { phone: { '$regex': new RegExp(req.body.search, 'i') } }, { name: { '$regex': new RegExp(req.body.search, 'i') } }] }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.get('/get_user_logs', auth.requiresAdmin, function(req, res) {
    admin_logs.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})


module.exports = router;