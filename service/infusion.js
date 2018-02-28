var express = require('express');
var router = express.Router();
var request = require('request')
var infusion_service = require("./infusion_service")
router.post('/test', function(req, res) {
    console.log("========================================================================================", req)

    // var Url = "https://signin.infusionsoft.com/app/oauth/authorize"
    // console.log("====================", Url + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full')

    // var requestObj = {
    //     url: Url + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full',
    //     method: "post",
    // }

    //     // var tokenUrl = "https://api.infusionsoft.com/token"
    //     // var requestObj = {
    //     //     url: tokenUrl + '?response_type=code&redirect_uri=localhost:3000/api/infusion/test&client_id=9gu4eryy3p42m3tnax2srfn6&scope=full',
    //     //     method: "post",
    //     // }
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
    //     var obj = JSON.parse(response.body);

    //     console.log(obj.count, "=================")
    //     res.json(response)
    // })
    res.json("testing")
    // infusion_service.createContact(req.body).then((infusion_data) => {
    //     if (infusion_data.statusCode == 201) {
    //         res.json(infusion_data)
    //     } else {
    //         res.json(infusion_data)
    //     }
    // })


})
module.exports = router;