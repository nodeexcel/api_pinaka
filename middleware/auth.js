var jwt = require("jsonwebtoken");
var moment = require("moment");
var Admin = require('../models/admin');

module.exports = {
    requiresAdmin(req, res, next) {
        const token = req.param("accessToken");
        if (token) {
            jwt.verify(token, "secret_key", (err, docs) => {
                if (err) {
                    next(res.status(401).send({ error: 1, message: "Invalid Token" }));
                } else {
                    const endTime = moment().unix();
                    const loginTime = docs.exp;
                    if (loginTime > endTime) {
                        req.token = docs.token;
                        Admin.findOne({ _id: req.token }).then((admin) => {
                            if (admin) {
                                req.user = admin;
                                next();
                            } else {
                                res.status(401).send({ error: 1, message: "You Are Not Authorized" });
                            }
                        });
                    }
                }
            });
        } else {
            res.status(401).send({ error: 1, message: "User is not logged in" });
        }
    }
}