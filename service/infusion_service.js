var request = require('request')
var infusion_session = require("../models/infusion_session")
var config = require('../config')

module.exports = {
    createContact(body, interestsTextArrayForInfusion) {
        // infusion custom fields id get it from here - https://developer.infusionsoft.com/docs/rest/#!/Contact/listCustomFieldsUsingGET

        return new Promise((resolve, reject) => {
            infusion_session.findOne().then((token) => {

                var data = {
                    "email_addresses": [{
                        "email": body.email,
                        "field": "EMAIL1"
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
                var CreateequestObj = {
                    url: `https://api.infusionsoft.com/crm/rest/v1/contacts?access_token=${token.access_token}`,
                    method: "post",
                    json: data
                }
                request(CreateequestObj, function(err, response) {
                    if (response.statusCode == 401) {
                        console.log('Received a 401 response!  Trying to refresh tokens.')
                        module.exports.checkForUnauthorized(body).then((infusion_data) => {
                            module.exports.createContact(body, interestsTextArrayForInfusion)
                        })
                    } else {
                        resolve(response)
                    }
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
                    if (response.statusCode == 401) {
                        console.log('Received a 401 response!  Trying to refresh tokens.')
                        module.exports.checkForUnauthorized(body).then((infusion_data) => {
                            module.exports.updateContact(body, interestsTextArrayForInfusion)
                        })
                    } else {
                        resolve(response)
                    }
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
                    if (response.statusCode == 401) {
                        console.log('Received a 401 response!  Trying to refresh tokens.')
                        module.exports.checkForUnauthorized(body).then((infusion_data) => {
                            module.exports.deleteContact(body)
                        })
                    } else {
                        resolve(response)
                    }
                })
            })
        })
    },

    checkForUnauthorized(body) {
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
                        'Authorization': 'Basic NWFhMjM1M2MzZmMwMzo0MDg3MGQ3MTNkMzRlNzM5MTdiOTM4NzY1NzUxOWRkMGJjN2UxOTcy',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    json: true,
                    form: data
                }
                request(requestObj, function(err, refresh_token) {
                    infusion_session.update({ _id: token._id }, refresh_token.body).then((data) => {
                        resolve(refresh_token)
                    })
                })
            })
        })
    }

}