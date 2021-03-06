﻿var express = require('express');
var app = express();
var router = express.Router();
var errorCode = require('../constants/errorcode');
var Contact = require('../models/contact');
var md5 = require('md5');
// var Twilio = require('twilio');
// var twilioConfig = require('../constants/twilio');
// var twilio = Twilio(twilioConfig.acccountSId, twilioConfig.authToken);
var Sms = require('../models/sms');
var ContactInterest = require('../models/contactinterest');
var Credit = require('../models/credit');
var mongoose = require('mongoose');
// var nodemailer = require('nodemailer');
var contact_source = require('../constants/contact_source');
// var infusion_service = require("../service/infusion_service")
var Interest = require('../models/interest');
var handlebars = require('handlebars');
var readfile = require('../service/readfile');


// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'test@test.com',
//         pass: 'test'
//     }
// });

router.get('/profile', function(req, res) {
    var token = req.query.token;

    if (token == null) {
        res.status(401).json({ code: errorCode.common.EMPTYTOKEN });
    } else {
        Contact.findOne({ token: token }).populate('interests.id').exec(function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorCode.common.INVALIDTOKEN });
            } else {

                Credit.find({ contact_id: mongoose.Types.ObjectId(user._id) }, function(err, credits) {
                    var ret = JSON.parse(JSON.stringify(user));
                    ret["creditcards"] = credits;
                    res.status(200).json(ret);
                });
            }
        });
    }
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("login=email,password====>", email + ":" + password)
    if (email == null || email == "") {
        res.status(401).json({ code: errorCode.login.EMPTYEMAIL });
    } else if (password == null || password == "") {
        res.status(401).json({ code: errorCode.login.EMPTYPASSWORD });
    } else {
        Contact.findOne({ email: email, password: md5(password) }).populate('interests.id').exec(function(err, user) {
            if (!user) {
                res.status(402).json({ code: errorCode.login.NOTMATCH });
            } else {
                Credit.find({ contact_id: mongoose.Types.ObjectId(user._id) }, function(err, credits) {
                    var ret = JSON.parse(JSON.stringify(user));
                    ret['creditcards'] = credits;
                    res.status(200).json(ret);
                });
            }
        });
    }
});

router.post('/signup', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var birthday = req.body.birthday;
    var zipcode = req.body.zipcode;
    var gender = req.body.gender;
    var marital = req.body.marital;
    var kids = req.body.kids;
    var phone = req.body.phone;
    var interests = req.body.interests;
    var source = req.body.source;
    var type = req.body.type;

    //null validate
    if (name == null || name == '') {
        res.status(401).json({ code: errorCode.signup.EMPTYNAME });
    } else if (email == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYEMAIL });
    } else if (birthday == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYBIRTHDAY });
    } else if (gender == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYGENDER });
    } else if (marital == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYMARITAL });
    } else if (zipcode == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYZIPCODE });
    } else if (kids == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYKIDS });
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
        let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        var random_password = 'java@123';

        //email, birthday, phone number, zipcode, gender, kids, marital, interest, type validate
        var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regZip = /^[0-9]{1,5}$/;
        var regPhone = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

        if (!reg.test(email)) {
            res.status(401).json({ code: errorCode.signup.INVALIDEMAIL });
        } else if (isNaN((new Date(birthday)).getTime())) {
            res.status(401).json({ code: errorCode.signup.INVALIDBIRTHDAY });
        } else if (gender != '0' && gender != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDGENDER });
        } else if (!regZip.test(zipcode)) {
            res.status(401).json({ code: errorCode.signup.INVALIDZIPCODE });
        } else if (marital != '0' && marital != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDMARITAL });
        } else if (kids != '0' && kids != '1') {
            res.status(401).json({ code: errorCode.signup.INVALIDKIDS });
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
                    contact.email = email;
                    contact.birthday = birthday;
                    contact.gender = gender;
                    contact.marital = marital;
                    contact.kids = kids;
                    contact.password = md5(random_password);
                    contact.temporary_password = true;
                    contact.created_at = new Date();
                    contact.updated_at = new Date();
                    contact.contact_source = contact_source.app_contact_source;;
                    contact.type = type;
                    contact.app_installed = true;
                    contact.Infusion_synced_date = new Date();
                    if (phone) {
                        contact.phone = phone;
                        contact.sms_option = true;
                    }
                    contact.zipcode = zipcode;
                    Interest.find({}, function(err, interestsData) {
                        var interestsTextArrayForInfusion = [];
                        if (interestsData.length > 0) {
                            for (var i = 0; i < interestsData.length; i++) {
                                var i_id = interestsData[i]._id;
                                if (req.body.interests != '' && req.body.interests != null && req.body.interests.indexOf(i_id) != -1) {
                                    interestsTextArrayForInfusion.push(interestsData[i].name)
                                }
                            }
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
                        // infusion_service.createContact(contact, interestsTextArrayForInfusion).then((infusion_data) => {
                            // if (infusion_data.statusCode == 201) {
                                // contact.infusion_id = infusion_data.body.id;
                                contact.infusion_id = Date.now()
                                contact.save(function(err, data) {
                                    if (err) {
                                        console.log("====>", err)
                                    } else {
                                        console.log("success")
                                        res.status(200).json(contact);
                                    }
                                    // readfile.readHTMLFile('./public/email_templates/signup.html', function(err, html) {
                                    //     var template = handlebars.compile(html);
                                    //     var replacements = {
                                    //         username: email,
                                    //         port: req.socket.localPort,
                                    //         name: name,
                                    //         randomPassword: random_password,
                                    //         host: req.hostname
                                    //     };
                                    //     var htmlToSend = template(replacements);
                                    //     var mailOptions = {
                                    //         from: 'test@test.com',
                                    //         to: contact.email,
                                    //         subject: 'Welcome to Pinaka',
                                    //         html: htmlToSend
                                    //     };

                                    //     transporter.sendMail(mailOptions, function(error, info) {
                                    //         if (error) {
                                    //             console.log("email error========>", error);
                                    //         } else {
                                    //             console.log('Email sent: ' + info.response);
                                    //         }
                                    //     });
                                    // })
                                });
                            // }
                        // })
                    })
                }
            });
        }
    }
});

router.post('/sendcode', function(req, res) {
    var phone = req.body.phone;

    var regPhone = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

    var code = Math.floor(Math.random() * 899999) + 100000;

    if (phone == null) {
        res.status(401).json({ code: errorCode.sendcode.EMPTYPHONE });
    }

    /*
    else if (!regPhone.test(phone)) {
        res.status(402).json({ code: errorCode.sendcode.INVALIDPHONE });
    }*/
    else {
        // twilio.messages.create({
        //     from: twilioConfig.from,
        //     to: "+1" + phone,
        //     body: 'Here is verify code. ' + code
        // }, function(err, result) {
        //     if (err) {
        //         res.status(402).json({ code: errorCode.sendcode.INVALIDPHONE });
        //     } else {
                //create code for sms verification
                var sms = new Sms();
                sms.phone = phone;
                sms.code = code;
                sms.created_at = new Date();
                sms.token = md5(sms.created_at);
                sms.save();
                res.status(200).json({ token: sms.token });
        //     }
        // });
    }
});

router.post('/logincode', function(req, res) {
    var token = req.body.token;
    var code = req.body.code;

    console.log("login code token,code info========>", token + ":" + code);

    if (token == null) {
        res.status(401).json({ code: errorCode.common.EMPTYTOKEN });
    } else if (code == null) {
        res.status(401).json({ code: errorCode.verifycode.EMPTYCODE });
    } else {
        Sms.findOne({ token: token, code: code }, function(err, item) {
            if (!item) {
                res.status(402).json({ code: errorCode.verifycode.INVALIDCODE });
            } else {
                Contact.findOne({ phone: item.phone }, function(err, user) {
                    if (!user) {
                        res.status(402).json({ code: errorCode.verifycode.INVALIDCODE });
                    } else {
                        Credit.find({ contact_id: mongoose.Types.ObjectId(user._id) }, function(err, credits) {
                            if (user.interests) {
                                ContactInterest.find({ contact_id: user._id }).populate('interest_id').exec(function(err, interests) {
                                    var ret = JSON.parse(JSON.stringify(user));
                                    ret['interests'] = interests;
                                    ret['creditcards'] = credits;
                                    res.status(200).json(ret);
                                });
                            } else {
                                var ret = JSON.parse(JSON.stringify(user));
                                ret['creditcards'] = credits;
                                res.status(200).json(ret);
                            }
                        });
                    }
                });
            }
        });
    }
});

router.post('/verifycode', function(req, res) {
    var token = req.body.token;
    var code = req.body.code;
    console.log("veryfycode==========>", token + ":" + code)
    if (token == null) {
        res.status(401).json({ code: errorCode.common.EMPTYTOKEN });
    } else if (code == null) {
        res.status(401).json({ code: errorCode.verifycode.EMPTYCODE });
    } else {
        Sms.findOne({ token: token, code: code }, function(err, item) {
            if (!item) {
                res.status(402).json({ code: errorCode.verifycode.INVALIDCODE });
            } else {
                Contact.findOne({ phone: item.phone }, function(err, user) {
                    if (err) {
                        res.status(402).json({ code: errorCode.SERVERERRPR });
                    } else if (!user) {
                        res.status(402).json({ code: errorCode.contact.NOTFOUND });
                    } else {
                        res.status(200).json(user);
                    }
                })

            }
        });
    }
});

router.put('/update', function(req, res) {
    var token = req.body.token;
    var name = req.body.name;
    var email = req.body.email;
    var birthday = req.body.birthday;
    var zipcode = req.body.zipcode;
    var gender = req.body.gender;
    var marital = req.body.marital;
    var kids = req.body.kids;
    var phone = req.body.phone;
    var interests = req.body.interests;
    var password = req.body.password;

    //validate
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var regZip = /^[0-9]{1,5}$/;
    var regPhone = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;

    if (token == null) {
        res.status(401).json({ code: errorCode.common.EMPTYTOKEN });
    } else if (name && name == '') {
        res.status(401).json({ code: errorCode.signup.EMPTYNAME });
    } else if (email && !reg.test(email)) {
        res.status(401).json({ code: errorCode.signup.INVALIDEMAIL });
    } else if (birthday && isNaN((new Date(birthday)).getTime())) {
        res.status(401).json({ code: errorCode.signup.INVALIDBIRTHDAY });
    } else if (zipcode && !regZip.test(zipcode)) {
        res.status(401).json({ code: errorCode.signup.INVALIDZIPCODE });
    } else if (gender && gender != '0' && gender != '1') {
        res.status(401).json({ code: errorCode.signup.INVALIDGENDER });
    } else if (marital && marital != '0' && marital != '1') {
        res.status(401).json({ code: errorCode.signup.INVALIDMARITAL });
    } else if (kids && kids != '0' && kids != '1') {
        res.status(401).json({ code: errorCode.signup.INVALIDKIDS });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorCode.common.INVALIDTOKEN });
            } else {
                user = JSON.parse(JSON.stringify(user));
                //update data
                if (name) {
                    user.name = name;
                }
                if (email) {
                    user.email = email;
                }
                if (birthday) {
                    user.birthday = birthday;
                }
                if (zipcode) {
                    user.zipcode = zipcode;
                }
                if (gender) {
                    user.gender = gender;
                }
                if (marital) {
                    user.marital = marital;
                }
                if (kids) {
                    user.kids = kids;
                }
                if (interests && interests != '') {
                    var interestDATA = [];
                    var interestsItems = interests.split(":");
                    for (var i = 0; i < interestsItems.length; i++) {
                        var temp = interestsItems[i].split(",");
                        interestDATA.push({
                            id: temp[0],
                            level: temp[1]
                        });
                    }
                    user.interests = interestDATA;
                }
                if (phone) {
                    user.phone = phone;
                }

                if (password) {
                    user.password = md5(password);
                }

                user.updated_at = new Date();
                console.log(user,"pppppppppppppppppppppppppppppppp")
                Contact.update({ _id: user._id }, user).then((data) => {
                    var html = "<h2 style='background-color: rgb(16,28,90); color: #fff; padding-top: 10px; padding-bottom: 10px;text-align:center; margin-bottom: 0px;'>PINAKA</h2>";
                    html += "<div style='background-color: #f3f3f3; padding: 10px;'><h3 style='margin-top: 0px;'>Hi <font color='#465e82'>@" + user.name + "</font>,</h3>";
                    html += "<p>We got a request to change your pinaka password.</p>";
                    html += "<p>If you didn't changed a password, <a href='http://pinaka.com' style='color: rgb(16,28,90)'>let us know</a></p></div>";

                    
                    Contact.findOne({ token: token }).populate('interests.id').exec(function(err, user1) {
                        Credit.find({ contact_id: mongoose.Types.ObjectId(user1._id) }, function(err, credits) {
                            var ret = JSON.parse(JSON.stringify(user1));
                            ret['creditcards'] = credits;
                            res.status(200).json(ret);
                        });
                    });
                });
            }
        });
    }
});

router.post('/forgot', function(req, res) {
    var email = req.body.email;
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email == null) {
        res.status(401).json({ code: errorCode.signup.EMPTYEMAIL });
    } else if (!reg.test(email)) {
        res.status(401).json({ code: errorCode.signup.INVALIDEMAIL });
    } else {
        Contact.findOne({ email: email }, function(err, user) {
            if (!user) {
                res.status(200).json({});
            } else {

                let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
                var random_password = '';
                for (var i = 0; i < 6; i++) {
                    random_password += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                Contact.update({ _id: user._id }, { $set: { temporary_password: true, password: md5(random_password) } }).then((data) => {
                    //send email
                    readfile.readHTMLFile('./public/email_templates/reset_password.html', function(err, html) {
                        var template = handlebars.compile(html);
                        var replacements = {
                            username: user.email,
                            port: req.socket.localPort,
                            name: user.name,
                            randomPassword: random_password
                        };
                        var htmlToSend = template(replacements);
                        var mailOptions = {
                            from: 'test@test.com',
                            to: email,
                            subject: 'Forgot password',
                            html: htmlToSend,
                            host: req.hostname
                        };

                        // transporter.sendMail(mailOptions, function(error, info) {
                        //     if (error) {
                        //         console.log("Email err========>", error);
                        //     } else {
                        //         console.log('Email sent: ' + info.response);
                        //     }
                        // });
                    })
                    res.status(200).json({});
                })
            }
        });
    }
});

router.post('/user_find', function(req, res) {
    var facebookId = req.body.facebookId;
    Contact.findOne({ facebookId: facebookId }, function(err, user) {
        if (!user) {
            res.json({ status: 0, message: 'user not exists', data: user })
        } else {
            res.json({ status: 1, message: 'user already exist', data: user })
        }
    })
})

router.post('/signup_login_fb', function(req, res) {
    console.log(req.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyy")
    req.body.contact_source = contact_source.app_contact_source;
    req.body.created_at = new Date();
    req.body.updated_at = new Date();
    req.body.app_installed = true;
    req.body.token = md5((req.body.email | req.body.facebookId) + req.body.created_at);
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!req.body.facebookId) {
        res.status(400).json({ code: errorCode.signup.EMPTYFACEBOOKID });
    } else {
        Contact.findOne({ $or: [{ email: req.body.email }, { facebookId: req.body.facebookId }] }).then((data) => {
            if (data) {
                Credit.find({ contact_id: mongoose.Types.ObjectId(data._id) }, function(err, credits) {
                    console.log(err,"---------------------------------------------")
                    var ret = JSON.parse(JSON.stringify(data));
                    ret["creditcards"] = credits;
                    res.status(200).json(ret);
                });
            } else {
                if (req.body.password) {
                    req.body.password = md5(req.body.password)
                }
                Interest.find({}, function(err, interests) {
                    var interestsTextArrayForInfusion = [];
                    if (interests.length > 0) {
                        for (var i = 0; i < interests.length; i++) {
                            var i_id = interests[i]._id;
                            if (req.body.interests != '' && req.body.interests != null && req.body.interests.indexOf(i_id) != -1) {
                                interestsTextArrayForInfusion.push(interests[i].name)

                            }
                        }
                    }
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
                        req.body.interests = interestDATA;
                    }
                    // infusion_service.createContact(req.body, interestsTextArrayForInfusion).then((infusion_data) => {
                    //     if (infusion_data.statusCode == 201) {
                    //         req.body.infusion_id = infusion_data.body.id;
                            Contact.create(req.body).then((data) => {
                                Credit.find({ contact_id: mongoose.Types.ObjectId(data._id) }, function(err, credits) {
                                    var ret = JSON.parse(JSON.stringify(data));
                                    ret["creditcards"] = credits;
                                    res.status(200).json(ret);
                                });
                            })
                    //     } else {
                    //         res.status(400).json({ error: 1, message: "something went wrong on infusionsoft" })
                    //     }
                    // })
                })
            }
        }, (err) => {
            console.log(err,"========================================")
            res.status(400).json({ error: 1, message: "error occured", err: err })
        })
    }
})

router.put('/change_password', function(req, res) {
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,40}$/;
    if (!req.body.email) {
        res.status(400).json({ code: errorCode.login.EMPTYEMAIL });
    } else if (!req.body.password) {
        res.status(400).json({ code: errorCode.login.EMPTYPASSWORD });
    } else if (!req.body.new_password) {
        res.status(400).json({ code: errorCode.login.EMPTYNEWPASSWORD });
    } else if (!passwordRegex.test(req.body.new_password)) {
        res.status(400).json({ code: errorCode.login.INVALIDNEWPASSWORD });
    } else {
        Contact.findOne({ email: req.body.email, password: md5(req.body.password) }).then((user) => {
            if (!user) {
                res.status(402).json({ code: errorCode.login.NOTMATCH });
            } else {
                Contact.update({ _id: user._id }, { $set: { temporary_password: false, password: md5(req.body.new_password) } }).then((data) => {
                    res.json({ status: 1, data: data })
                })
            }
        })
    }
})
module.exports = router;