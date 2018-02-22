var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var admin_logs_schema = new Schema({}, {
    strict: false
});

module.exports = mongoose.model('admin_logs', admin_logs_schema);