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

var industrySchema = new mongoose.Schema({
    industry: String,
    inStateTotalAmount : Number,
    outOfStateTotalAmount : Number,
    label: String,
    sortOrder: Number,
    icon: String
});


mongoose.model('companyModel', companySchema, 'company');
mongoose.model('industryModel', industrySchema, 'industry');

//mongoose.connect('mongodb://127.0.0.1:27017/nodetest1');
mongoose.connect('mongodb://admin:falcon2000@ds062898.mongolab.com:62898/wygovpaymongolab');

