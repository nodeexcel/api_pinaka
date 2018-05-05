var request = require('request')
var infusion_session = require("../models/infusion_session")
var config = require('../config')

module.exports = {
    createContact(body, interestsTextArrayForInfusion) {
        // infusion custom fields id get it from here - https://developer.infusionsoft.com/docs/rest/#!/Contact/listCustomFieldsUsingGET

        return new Promise((resolve, reject) => {
            // body.birthday+=1;
            infusion_session.findOne().then((token) => {
                if (body.birthday) {
                    var tomorrow = new Date(body.birthday);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    body.birthday = tomorrow;
                }
                var data = {
                    "email_addresses": [{
                        "email": body.email,
                        "field": "EMAIL1"
                    }],
                    "phone_numbers": [{
                        "number": body.phone,
                        "field": "PHONE1"
                    }],
                    "birthday": body.birthday,
                    "given_name": body.name,
                    "family_name": body.lastName,
                    "custom_fields": [{
                        "content": body.app_installed,
                        "id": config.customFieldAppInstalledId
                    }, {
                        "content": interestsTextArrayForInfusion,
                        "id": config.customFieldInterestsId
                    }, {
                        "content": body.CodeRedeemFlag,
                        "id": config.customFieldRedeemCodeFlagId
                    }]
                };
                var CreateequestObj = {
                    url: `https://api.infusionsoft.com/crm/rest/v1/contacts?access_token=${token.access_token}`,
                    method: "post",
                    json: data
                }
                request(CreateequestObj, function(err, response) {
                    resolve(response)
                })
            })
        })
    },

    updateContact(body, interestsTextArrayForInfusion) {
        return new Promise((resolve, reject) => {
            infusion_session.findOne().then((token) => {
                var data = {
                    "email_addresses": [{
                        "email": body.email,
                        "field": "EMAIL1"
                    }],
                    "phone_numbers": [{
                        "number": body.phone,
                        "field": "PHONE1"
                    }],
                    "given_name": body.name,
                    "family_name": body.lastName,
                    "custom_fields": [{
                        "content": body.app_installed,
                        "id": config.customFieldAppInstalledId
                    }, {
                        "content": interestsTextArrayForInfusion,
                        "id": config.customFieldInterestsId
                    }, {
                        "content": body.CodeRedeemFlag,
                        "id": config.customFieldRedeemCodeFlagId
                    }]
                };
                var updateRequestObj = {
                    url: `https://api.infusionsoft.com/crm/rest/v1/contacts/${body.infusion_id}?access_token=${token.access_token}`,
                    method: "patch",
                    json: data
                }
                request(updateRequestObj, function(err, response) {
                    resolve(response)
                })
            })
        })
    },

    deleteContact(body) {
        return new Promise((resolve, reject) => {
            infusion_session.findOne().then((token) => {
                var updateRequestObj = {
                    url: `https://api.infusionsoft.com/crm/rest/v1/contacts/${body.infusion_id}?access_token=${token.access_token}`,
                    method: "delete",
                }
                request(updateRequestObj, function(err, response) {
                    resolve(response)
                })
            })
        })
    },

    checkForUnauthorized() {
        return new Promise(function(resolve, reject) {
            infusion_session.findOne().then((token) => {
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
                        console.log("access token regenerated for infusion")
                        resolve(refresh_token)
                    })
                })
            })
        })
    }

}