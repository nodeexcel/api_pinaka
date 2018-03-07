var express = require('express');
var router = express.Router();
var request = require('request')
var infusion_service = require("./infusion_service")
var infusion_session = require("../models/infusion_session")
router.post('/test', function(req, res) {

    infusion_session.findOne().then((token) => {
        console.log(token)
        var url = "https://api.infusionsoft.com/token"
        var encode = new Buffer("9gu4eryy3p42m3tnax2srfn6:JtPc4smbYU").toString('base64');
        var data = {
            'grant_type': 'refresh_token',
            'refresh_token': token.refresh_token
        };
        var requestObj = {
            method: "POST",
            uri: url,
            headers: {
                'Authorization': 'Basic ' + encode,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            json: true,
            form: data
        }
        request(requestObj, function(err, refresh_token) {
            infusion_session.update({ _id: token._id }, refresh_token.body).then((data) => {
                console.log(refresh_token.statusCode)
                res.json({ status: 1, data: refresh_token, test: data })
            }, (err) => {
                res.status(400).json({ error: 1, message: "error occured", err: err })
            })
        })
    })
})


module.exports = router;