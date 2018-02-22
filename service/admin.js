var md5 = require('md5');
var Admin = require('../models/admin');
var config = require('../config.json')
module.exports = {
    defaultAdmin() {
        Admin.findOne({ email: config.adminEmail }).then((data) => {
            if (!data) {
                var adminData = new Admin({
                    email: config.adminEmail,
                    name: config.adminName,
                    password: md5(config.adminPassword),
                    role: config.role
                });
                adminData.save(function(err, data) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
        })
    }
}