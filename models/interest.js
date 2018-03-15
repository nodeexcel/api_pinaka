var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InterestSchema = new Schema({
    name: String,
    description: String,
    order: Number
});

module.exports = mongoose.model('interests', InterestSchema);