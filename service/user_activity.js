var admin_logs = require("../models/admin_logs")
module.exports = {
    userActivityLogs(req, response) {
        return new Promise((resolve, reject) => {
            if (!req.user) {
                resolve()
            } else {
                let data = response;
                response = response.data ? response.data : response.dataValues;
                admin_logs.findOne({ email: req.user.email }).exec(function(err, result) {
                    if (result) {
                        admin_logs.update({ "email": req.user.email }, { "$push": { "action": req.originalUrl.toString(), "time": new Date().toString(), "json": response || data } }).exec(function(err, result) {
                            console.log("logs saved")
                        })
                    } else {
                        var activity = new admin_logs({ "email": req.user.email, "action": [req.originalUrl.toString()], time: [new Date().toString()], json: [response || data] })
                        activity.save(function(err, result) {
                            console.log("logs saved")
                        })
                    }
                })
            }
        })
    }
}