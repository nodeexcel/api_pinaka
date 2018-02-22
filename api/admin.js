var express = require('express');
var router = express.Router();
var errorCode = require('../constants/errorcode');
var Contact = require('../models/contact');
var Admin = require('../models/admin');
var md5 = require('md5');
var errorCode = require('../constants/errorcode');
var auth = require("../middleware/auth");
var jwt = require("jsonwebtoken");


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
                res.json({ status: 1, token: token });
            } else {
                res.status(402).json({ message: "invalid username or password" });
            }
        })
    }
})

router.post('/addAdminStaff', function(req, res) {
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
        req.body.password = md5(req.body.password)
        req.body.lastLogin = new Date();
        var adminData = new Admin(req.body);
        Admin.findOne({ email: req.body.email }).then((data) => {
            if (!data) {
                adminData.save(function(err, data) {
                    if (err) {
                        res.json(err)
                    } else {
                        res.json({ status: 1, data: data })
                    }
                })
            } else {
                res.status(400).json({ error: 1, message: "email already exist" });
            }
        })
    }
})

router.get('/getAllAdminStaff', function(req, res) {
    Admin.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.put('/updateAdminStaff', function(req, res) {
    Admin.update({ _id: req.body._id }, req.body).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.delete('/deleteAdminStaff', function(req, res) {
    Admin.remove({ _id: req.body._id }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/searchAdminStaff', function(req, res) {
    let where = '';
    if (req.body.type == "email") {
        where = { 'email': { '$regex': new RegExp(req.body.email, 'i') } }
    } else if (req.body.type == "name") {
        where = { 'phone': { '$regex': new RegExp(req.body.name, 'i') } }
    } else {
        res.status(400).json({ error: 1, message: "please enter email or name" })
    }
    Admin.find(where, { "_id": 1, "name": 1, "email": 1 }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/addCustomer', function(req, res) {
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
    var redeemCode = req.body.redeemCode;
    var anniversary = req.body.anniversary;
    var occupation = req.body.occupation;


    //null validate
    if (name == null || name == '') {
        res.status(401).json({ code: errorCode.signup.EMPTYNAME });
    } else if (email == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYEMAIL });
    } else if (birthday == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYBIRTHDAY });
    } else if (zipcode == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYZIPCODE });
    } else if (gender == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYGENDER });
    } else if (marital == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYMARITAL });
    } else if (kids == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYKIDS });
    } else if (password == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYPASS });
    } else if (source == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYSOURCE });
    } else if (type == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYTYPE });
    } else if (interests == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYINTEREST });
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
            res.status(401).json({ code: errorCode.signup.INVALIDEMAIL });
        } else if (isNaN((new Date(birthday)).getTime())) {
            res.status(401).json({ code: errorCode.signup.INVALIDBIRTHDAY });
        } else if (!regZip.test(zipcode)) {
            res.status(401).json({ code: errorCode.signup.INVALIDZIPCODE });
        } else if (gender != '0' && gender != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDGENDER });
        } else if (marital != '0' && marital != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDMARITAL });
        } else if (kids != '0' && kids != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDKIDS });
        } else if (source != '0' && source != '1' && source != '2' && source != '3') {
            res.status(401).json({ code: errorCode.signup.INVALIDSOURCE });
        } else if (type != '0' && type != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDTYPE });
        } else {
            //existing email or phone validate
            var contact = new Contact;
            Contact.findOne({ $or: [{ email: email }, { phone: phone }] }, function(err, user) {
                if (user && user.email == email && email) {
                    res.status(402).json({ code: errorCode.signup.DUPLICATEEMAIL });
                } else if (user && user.phone == phone && phone) {
                    res.status(402).json({ code: errorCode.signup.DUPLICATEPHONE });
                } else {
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
                    contact.save(function(err, data) {
                        if (err) {
                            res.status(400).json({ error: 1, message: "error occured", err: err })
                        } else {
                            res.status(200).json({ status: 1, data: data });
                        }
                    });
                }
            });
        }
    }
})

router.put('/updateCustomer', function(req, res) {
    Contact.update({ _id: req.body._id }, req.body).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.delete('/deleteCustomer', function(req, res) {
    Contact.remove({ _id: req.body._id }).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.get('/getAllCustomer', function(req, res) {
    Contact.find({}).then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})

router.post('/search_allCustomers', function(req, res) {
    let where = '';
    if (req.body.type == "email") {
        where = { 'email': { '$regex': new RegExp(req.body.email, 'i') } }
    } else if (req.body.type == "phone") {
        where = { 'phone': { '$regex': new RegExp(req.body.phone, 'i') } }
    } else {
        res.status(400).json({ error: 1, message: "please enter email or phone" })
    }
    Contact.find(where, { "_id": 1, "token": 1, "name": 1, "lastname": 1, "phone": 1, "email": 1, "sms_option": 1, "app_installed": 1 }).populate('interests.id').then((data) => {
        res.json({ status: 1, data: data })
    }, (err) => {
        res.status(400).json({ error: 1, message: "error occured", err: err })
    })
})



module.exports = router;