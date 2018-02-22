var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var redeemCodeSchema = new Schema({
    redeem_code: String,
    type: { type: String, enum: ['Universal', 'General'] },
    active_status: { type: String, enum: ['Active', 'InActive'], default: 'Active' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('redeemCode', redeemCodeSchema);