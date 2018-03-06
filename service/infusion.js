var express = require('express');
var router = express.Router();
var request = require('request')
var infusion_service = require("./infusion_service")
router.post('/test', function(req, res) {
    // console.log("========================================================================================", req)
    // console.log(req.headers)
    // var hookSecret = req.headers.X-Hook-Secret
    // var hookSecret = req.headers['X-Hook-Secret'];
    // var url = "https://api.infusionsoft.com/token?grant_type=refresh_token&refresh_token=3wsead8ufg4j4f26y7ncwuam"



    var url = "https://api.infusionsoft.com/token"
    var encode = new Buffer("9gu4eryy3p42m3tnax2srfn6:JtPc4smbYU").toString('base64');
    // var data = {
    //     'grant_type': 'refresh_token',
    //     'refresh_token': '39z2a6pexvwjxkuc5qdhb7vq'
    // };
    // console.log(data)
    var requestObj = {
        method: "POST",
        uri: url,
        headers: {
            'Authorization': 'Basic ' + encode,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        json: true,
        form: 'grant_type=refresh_token&refresh_token=u5ypq9vgmcecfre6zkjvstsv'
    }
    request(requestObj, function(err, refresh_token) {
        // console.log(refresh_token)
        res.json(refresh_token)
    })






    // var Url = "https://accounts.infusionsoft.com/app/oauth/authorize?response_type=code&redirect_uri=https%3A%2F%2Fdeveloper.infusionsoft.com%2Fdocs%2Frest%2Fo2c.html&realm=realm&client_id=9gu4eryy3p42m3tnax2srfn6&scope=&state=0.5501674243911037"
    // // console.log("====================", Url + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full')

    // var requestObj = {
    //     url: Url + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full',
    //     method: "post",
    // }

    // var tokenUrl = "https://api.infusionsoft.com/token"
    // var requestObj = {
    //     url: tokenUrl + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full&grant_type=authorization_code',
    //     method: "post",
    // }
    // var data = {
    //     "email_addresses": [{
    //         "email": "test1@gmail.com",
    //         "field": "EMAIL1"
    //     }],
    //     "given_name": "testexcel",
    //     "family_name": "testing"
    // };
    // var requestObj = {
    //     url: 'https://api.infusionsoft.com/crm/rest/v1/contacts?email=test1@gmail.com&access_token=8mumwrje7xswfcwdry8y9f8m',
    //     method: "get",
    // }

    // // var requestObj = {
    // //     url: 'https://api.infusionsoft.com/crm/rest/v1/contacts?access_token=8mumwrje7xswfcwdry8y9f8m',
    // //     method: "get",
    // //     json: data
    // // }


    // // {
    // // "email_addresses": [
    // //     {
    // //       "email": "test@gmail.com",
    // //       "field": "EMAIL1"
    // //     }
    // //   ]
    // // }

    // // Make API call
    // request(requestObj, function(err, response) {
    // //     var obj = JSON.parse(response.body);

    // //     console.log(obj.count, "=================")
    //     res.json(response)
    // })

    // res.setHeader('X-Hook-Secret', hookSecret)

    // res.json("testing")
    // infusion_service.createContact(req.body).then((infusion_data) => {
    //     if (infusion_data.statusCode == 201) {
    //         res.json(infusion_data)
    //     } else {
    //         res.json(infusion_data)
    //     }
    // })


})
module.exports = router;