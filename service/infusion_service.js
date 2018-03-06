var request = require('request')

module.exports = {
    createContact(body, interestsTextArrayForInfusion) {
        // infusion custom fields id get it from here - https://developer.infusionsoft.com/docs/rest/#!/Contact/listCustomFieldsUsingGET
        // redeemCode = 20
        // App Installed = 18
        // interests = 22

        return new Promise((resolve, reject) => {
            var requestObj = {
                url: `https://api.infusionsoft.com/crm/rest/v1/contacts?email=${body.email}&access_token=39z2a6pexvwjxkuc5qdhb7vq`,
                method: "get",
            }
            request(requestObj, function(err, exist_check) {
                var obj = JSON.parse(exist_check.body);
                if (obj.count != 0) {
                    resolve({ error: 1, message: "contact already exist on infusionsoft" })
                } else {
                    var data = {
                        "email_addresses": [{
                            "email": body.email,
                            "field": "EMAIL1"
                        }],
                        "given_name": body.name,
                        "family_name": body.lastName,
                        "custom_fields": [{
                            "content": body.redeemCode,
                            "id": 20
                        }, {
                            "content": body.app_installed,
                            "id": 18
                        }, {
                            "content": interestsTextArrayForInfusion,
                            "id": 22
                        }]
                    };
                    var CreateequestObj = {
                        url: `https://api.infusionsoft.com/crm/rest/v1/contacts?access_token=39z2a6pexvwjxkuc5qdhb7vq`,
                        method: "post",
                        json: data
                    }
                    request(CreateequestObj, function(err, response) {
                        if (response) {
                            resolve(response)
                        } else {
                            reject(err)
                        }
                    })
                }
            })
        })
    },

    updateContact(body, interestsTextArrayForInfusion) {
        return new Promise((resolve, reject) => {
            var data = {
                "email_addresses": [{
                    "email": body.email,
                    "field": "EMAIL1"
                }],
                "given_name": body.name,
                "family_name": body.lastName
            };
            var updateRequestObj = {
                url: `https://api.infusionsoft.com/crm/rest/v1/contacts/${body.infusion_id}?access_token=39z2a6pexvwjxkuc5qdhb7vq`,
                method: "patch",
                json: data
            }
            request(updateRequestObj, function(err, response) {
                if (response) {
                    resolve(response)
                } else {
                    reject(err)
                }
            })
        })
    },

    deleteContact(body) {
        return new Promise((resolve, reject) => {
            var updateRequestObj = {
                url: `https://api.infusionsoft.com/crm/rest/v1/contacts/${body.infusion_id}?access_token=39z2a6pexvwjxkuc5qdhb7vq`,
                method: "delete",
            }
            request(updateRequestObj, function(err, response) {
                if (response) {
                    resolve(response)
                } else {
                    resolve(err)
                }
            })
        })
    }

}