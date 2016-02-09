var mongoose = require('mongoose');

var lineSchema = new mongoose.Schema({
    transdate : Date,
    type : String,
    totalAmount : Number,
    lineAmount : Number,
    vendorName : String,
    invoice : String,
    agency : String,
    desc : String,
    contact : String,
    doc : String
});

var companySchema = new mongoose.Schema({
    companyName : String,
    industry : String,
    inState : Boolean,
    summaryAmount: Number,
    lines : [lineSchema]
});


mongoose.model('companyModel', companySchema, 'company');

mongoose.connect('mongodb://127.0.0.1:27017/nodetest1');
