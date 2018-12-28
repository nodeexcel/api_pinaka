var express = require('express');
var router = express.Router();
var errorcode = require('../constants/errorcode');
var Contact = require('../models/contact');
var Reservation = require('../models/reservation');
var mongoose = require('mongoose');
var Credit = require('../models/credit');
// var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var readfile = require('../service/readfile');
// var stripe = require('stripe')('sk_live_ib6BSc0XCCfMX1BONJi3ksu9');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'test@test.com',
//         pass: 'test'
//     }
// });
var moment = require('moment');

router.get('/', function(req, res) {
    var token = req.query.token;
    var status = req.query.status; // if type is true, active, or if false,  history
    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (status == null && status != 0 && status != 1) {
        res.status(401).json({ code: errorcode.reservation.INVALIDSTATUS });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                if (status) {
                    Reservation.find({ contact_id: mongoose.Types.ObjectId(user._id), status: status }).populate('feed_id').exec(function(err, reservations) {
                        res.status(200).json(reservations);
                    });
                } else {
                    Reservation.find({ contact_id: mongoose.Types.ObjectId(user._id) }).populate('feed_id').exec(function(err, reservations) {
                        res.status(200).json(reservations);
                    });
                }

            }
        });
    }
});

router.get('/all', function(req, res) {
    var token = req.query.token;
    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                Reservation.find({}, function(err, reservations) {
                    res.status(200).json(reservations);
                });
            }
        });
    }
});

router.post('/', function(req, res) {
    var token = req.body.token;
    var feed_id = req.body.feed_id;
    var people_count = req.body.people_count;
    var lane_count = req.body.lane_count;
    var booking_time = req.body.booking_time;
    var purchase_amount = req.body.purchase_amount;
    var number = req.body.number;
    var cvv = req.body.cvv;
    var expired_m = req.body.expired_m;
    var expired_y = req.body.expired_y;

    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (feed_id == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYFEEDID });
    } else if (people_count == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYPEOPLECOUNT });
    } else if (lane_count == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYLANECOUNT });
    } else if (booking_time == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYBOOKINGTIME });
    } else if (purchase_amount == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYPURCHASEAMOUNT });
    } else if (isNaN(people_count) || people_count.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDPEOPLECOUNT });
    } else if (isNaN(lane_count) || lane_count.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDLANECOUNT });
    } else if (isNaN((new Date(booking_time)).getTime())) {
        res.status(401).json({ code: errorcode.reservation.INVALIDBOOKINGTIME });
    } else if (isNaN(purchase_amount) || purchase_amount.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDPEOPLECOUNT });
    } else if (number == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYNUMBER });
    } else if (cvv == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYCVV });
    } else if (expired_m == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYEXPIREDM });
    } else if (expired_y == null) {
        res.status(401).json({ code: errorcode.reservation.EMPTYEXPIREDY });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                var reservation = new Reservation();
                reservation.created_at = new Date();
                reservation.contact_id = user._id;
                reservation.feed_id = feed_id;
                reservation.people_count = people_count;
                reservation.lane_count = lane_count;
                reservation.booking_time = booking_time;
                reservation.purchase_amount = purchase_amount;
                reservation.reservation_hours = req.body.reservation_hours;
                reservation.status = 0;
                if (req.body.showTime) {
                    reservation.showTime = req.body.showTime;
                }
                // //pay stripe
                // stripe.charges.create({
                //     amount: parseFloat(reservation.purchase_amount) * 100,
                //     currency: 'usd',
                //     card: {
                //         number: number,
                //         exp_month: expired_m,
                //         exp_year: expired_y
                //     },
                //     description: 'test payment for reservation',
                //     capture: true
                // }, function(err, res1) {
                //     console.log(err, "============================")
                //     // console.log(res1);


                //     if (!err) {
                //         console.log("ppppppppppppppppppp")
                reservation.confirmation_id = req.body.paymentId;

                //send mail
                let tableRows = "<tr><td style='border: 1px solid #ddd;padding: 8px;''>" + booking_time + "</td>"
                tableRows += "<td style='border: 1px solid #ddd;padding: 8px;''>" + req.body.article + "</td>"
                tableRows += "<td style='border: 1px solid #ddd;padding: 8px;''>" + people_count + "</td>"
                tableRows += "<td style='border: 1px solid #ddd;padding: 8px;''>" + "$" + req.body.actual_price + "</td>"
                tableRows += "<td style='border: 1px solid #ddd;padding: 8px;''>" + "$" + purchase_amount + "</td>"
                tableRows += "<td style='border: 1px solid #ddd;padding: 8px;''>" + "$" + purchase_amount + "</td></tr>"

                readfile.readHTMLFile('./public/email_templates/book_reservation.html', function(err, html) {
                    var template = handlebars.compile(html);
                    var replacements = {
                        port: req.socket.localPort,
                        name: user.name,
                        reservation_for: req.body.reservation_for,
                        host: req.hostname,
                        tablerows: tableRows
                    };
                    var htmlToSend = template(replacements);
                    var mailOptions = {
                        from: 'test@test.com',
                        to: user.email,
                        subject: 'payment',
                        html: htmlToSend
                    };

                    // transporter.sendMail(mailOptions, function(error, info) {
                    //     if (error) {
                    //         console.log("email error========>", error);
                    //     } else {
                    //         console.log('Email sent: ' + info.response);
                    //     }
                    // });
                })

                reservation.save(function(err) {
                    if (err) {
                        res.status(403).json({ code: errorcode.reservation.UNKNOWN });
                    } else {
                        res.status(200).json(reservation);
                    }
                });
                //     } else {
                //         res.status(402).json({ code: errorcode.reservation.INVALIDCARDINFO });
                //     }
                // });
            }
        });
    }
});

router.put('/', function(req, res) {
    var token = req.body.token;
    var reservation_id = req.body.reservation_id;
    var people_count = req.body.people_count;
    var lane_count = req.body.lane_count;
    var booking_time = req.body.booking_time;
    var purchase_amount = req.body.purchase_amount;
    var feed_id = req.body.feed_id;

    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (reservation_id == null) {
        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
    } else if (people_count && isNaN(people_count) || people_count.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDPEOPLECOUNT });
    } else if (lane_count && isNaN(lane_count) || lane_count.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDLANECOUNT });
    } else if (booking_time && isNaN((new Date(booking_time)).getTime())) {
        res.status(401).json({ code: errorcode.reservation.INVALIDBOOKINGTIME });
    } else if (purchase_amount && isNaN(purchase_amount) || purchase_amount.trim() == '') {
        res.status(401).json({ code: errorcode.reservation.INVALIDPEOPLECOUNT });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                Reservation.findById(reservation_id, function(err, reservation) {
                    if (!reservation) {
                        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
                    } else {
                        if (feed_id) {
                            reservation.feed_id = feed_id;
                        }
                        if (people_count) {
                            reservation.people_count = people_count;
                        }
                        if (lane_count) {
                            reservation.lane_count = lane_count;
                        }
                        if (booking_time) {
                            reservation.booking_time = booking_time;
                        }
                        if (purchase_amount) {
                            reservation.purchase_amount = purchase_amount;
                        }

                        reservation.updated_at = new Date();
                        reservation.save(function(err) {
                            if (err) {
                                res.status(403).json({ code: errorcode.reservation.UNKNOWN });
                            } else {
                                res.status(200).json(reservation);
                            }
                        });
                    }
                });
            }
        });
    }
});

router.post('/cancel', function(req, res) {
    var token = req.body.token;
    var reservation_id = req.body.reservation_id;

    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (reservation_id == null) {
        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                Reservation.findById(reservation_id, function(err, reservation) {
                    if (!reservation) {
                        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
                    } else {
                        reservation = JSON.parse(JSON.stringify(reservation));
                        // console.log(reservation, "reservationmnnnnnnnnnnnnn")
                        reservation.status = 2;
                        reservation.updated_at = new Date();
                        //refunds
                        // stripe.charges.refund(
                        //     reservation.confirmation_id,
                        //     function(err, refund) {
                        //         if (err) {
                        //             console.log(err, "cancelllllllllllllllllll");
                        //             res.status(403).json({ code: errorcode.reservation.UNKNOWN });
                        //         } else {
                                    reservation.confirmation_id = null;
                                    reservation.update({ _id: reservation_id }, reservation).then((data)=>{
                                            console.log(reservation,reservation_id,data,"---------------------------------------------------------")
                                            res.status(200).json(reservation);
                                            readfile.readHTMLFile('./public/email_templates/cancel_reservation.html', function(err, html) {
                                                var template = handlebars.compile(html);
                                                var replacements = {
                                                    port: req.socket.localPort,
                                                    name: user.name,
                                                    reservation_for: req.body.reservation_for,
                                                    host: req.hostname
                                                };
                                                var htmlToSend = template(replacements);
                                                var mailOptions = {
                                                    from: 'test@test.com',
                                                    to: user.email,
                                                    subject: 'reservation canceled',
                                                    html: htmlToSend
                                                };

                                                // transporter.sendMail(mailOptions, function(error, info) {
                                                //     if (error) {
                                                //         console.log("email error========>", error);
                                                //     } else {
                                                //         console.log('Email sent: ' + info.response);
                                                //     }
                                                // });
                                            })
                                    });
                            //     }
                            // });
                    }
                });
            }
        });
    }
});

router.post('/pay', function(req, res) {
    var token = req.body.token;
    var reservation_id = req.body.reservation_id;
    var credit_id = req.body.credit_id;

    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (reservation_id == null) {
        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                Reservation.findById(reservation_id, function(err, reservation) {
                    if (!reservation) {
                        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
                    } else {
                        Credit.findOne({ contact_id: mongoose.Types.ObjectId(user._id), _id: mongoose.Types.ObjectId(credit_id) }, function(err, credit) {
                            if (!credit) {
                                res.status(401).json({ code: errorcode.credit.INVALIDID });
                            } else {
                                console.log("----------------------------------")
                                res.json({status:1, message:"success"})
                                // stripe.charges.create({
                                //     amount: reservation.purchase_amount,
                                //     currency: 'usd',
                                //     card: {
                                //         number: credit.number,
                                //         exp_month: credit.expired_m,
                                //         exp_year: credit.expired_y
                                //     },
                                //     description: 'test payment for reservation',
                                //     capture: false
                                // }, function(err, res) {
                                //     if (!err) {

                                //     } else {
                                //         res.status(402).json({ code: errorcode.credit.INVALIDNUMBER });
                                //     }
                                // });
                            }
                        });
                    }
                });
            }
        });
    }
});

router.delete('/', function(req, res) {
    var token = req.body.token;
    var reservation_id = req.body.reservation_id;

    if (token == null) {
        res.status(401).json({ code: errorcode.common.EMPTYTOKEN });
    } else if (reservation_id == null) {
        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
    } else {
        Contact.findOne({ token: token }, function(err, user) {
            if (!user) {
                res.status(401).json({ code: errorcode.common.INVALIDTOKEN });
            } else {
                Reservation.findById(reservation_id, function(err, reservation) {
                    if (!reservation) {
                        res.status(401).json({ code: errorcode.reservation.INVALIDRESERVATIONID });
                    } else {
                        reservation.remove(function(err) {
                            if (err) {
                                res.status(403).json({});
                            } else {
                                res.status(200).json({});
                            }
                        });
                    }
                });
            }
        });
    }
});




module.exports = router;