var express = require('express');
var api = require('infusionsoft-api');
var router = express.Router();

// var infusionsoft = new api.DataContext('pinaka', '9gu4eryy3p42m3tnax2srfn6');

router.post('/test', function(req, res) {
    // infusionsoft.Contacts
    //     .where(Contact.Id, '32')
    //     .select(Contact.Id, Contact.Email)
    //     .toArray()
    //     .done(function(err, result) {
    //         if (err) {
    //             console.log("=======================", err)
    //         } else {
    //             console.log(result, "===============================");
    //         }
    //     });
    // console.log("=======================================infusionsoft", infusionsoft)
})
module.exports = router;