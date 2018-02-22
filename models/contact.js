﻿﻿
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
    name: String,
    lastName: String,
    email: String,
    phone: String,
    sms_option: { type: Boolean, default: false },
    app_installed: { type: Boolean, default: false },
    address1: String,
    address2: String,
    city: String,
    state: String,
    birthday: Date,
    zipcode: String,
    CodeRedeemFlag: { type: Boolean, default: false },
    redeemCode: [{ id: { type: Schema.Types.ObjectId, ref: 'redeemCode' }, level: Number }],
    createdBy: String,
    updatedBy: String,
    Infusion_synced_date: Date,
    anniversary: Date,
    gender: Boolean,
    kids: Boolean,
    marital: Boolean,
    occupation: String,
    interests: [{ id: { type: Schema.Types.ObjectId, ref: 'interests' }, level: Number }],
    contact_source: Number,
    password: String,
    type: Boolean,
    created_at: Date,
    updated_at: Date,
    token: String
});

module.exports = mongoose.model('contacts', ContactSchema);