var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var infusion_session = new Schema({
    access_token: String,
    token_type: String,
    expires_in: Number,
    refresh_token: String,
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('infusionSession', infusion_session);