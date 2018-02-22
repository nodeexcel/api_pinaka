var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminStaffSchema = new Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, enum: ['Admin', 'Staff'] },
    active_status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
    lastLogin: Date
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('AdminStaff', AdminStaffSchema);