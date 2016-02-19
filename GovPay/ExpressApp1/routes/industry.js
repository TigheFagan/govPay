var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var CompanyModel = mongoose.model('companyModel');

router.get('/', function(req, res) {
    var industryID = req.query.id;
    var inStateCompanies = [];
    var inStateTotal = 0;
    var outOfStateCompanies = [];
    var outOfStateTotal = 0;
    CompanyModel.find({ industry: industryID }, {}, { sort: { summaryAmount: -1 }, limit: 1000 },
        function (err, result) {
            console.log(err);
        for (var i = 0; i < result.length; i++) {
                var x = 5004000;
                console.log(x.formatMoney());
                if (result[i].inState === true) {
                    inStateTotal = inStateTotal + result[i].summaryAmount;
                    inStateCompanies.push(result[i]);
                } else if (result[i].inState === false) {
                    outOfStateTotal = outOfStateTotal + result[i].summaryAmount;
                    outOfStateCompanies.push(result[i]);
                }
            }
            res.render('industryDetail', {
                inStateCompanies: inStateCompanies,
                outOfStateCompanies: outOfStateCompanies,
                inStateTotal: inStateTotal,
                outOfStateTotal: outOfStateTotal
            });
    });
});

router.get('/summary', function(req, res) {
    CompanyModel.find({}, { industry: 'industry', summaryAmount: 'summaryAmount', inState: 'inState' }, {}, function (err, result) {
        console.log(err);
        var lookup = {};
        for (var i = 0; i < result.length; i++) {
            //console.log("from DB: " + result[i].industry + " " + result[i].summaryAmount + ' ' + lookup[result[i].industry]);
            if (lookup[result[i].industry] === undefined) {
                lookup[result[i].industry] = { total: 0, instate: 0, outstate: 0, instatepercent: 0, outstatepercent: 0 };
            }
            lookup[result[i].industry].total = lookup[result[i].industry].total + result[i].summaryAmount;
            if (result[i].inState) {
                lookup[result[i].industry].instate = lookup[result[i].industry].instate + result[i].summaryAmount;
            } else {
                lookup[result[i].industry].outstate = lookup[result[i].industry].outstate + result[i].summaryAmount;
            }
            lookup[result[i].industry].instatepercent = (lookup[result[i].industry].instate / lookup[result[i].industry].total * 100).toFixed(2);
            lookup[result[i].industry].outstatepercent = (lookup[result[i].industry].outstate / lookup[result[i].industry].total * 100).toFixed(2);
        
            if (result[i].industry === "7") {
                console.log('------------------');
                console.log(result[i].industry + " " + lookup[result[i].industry].total + " " +
                    lookup[result[i].industry].instate + " " + lookup[result[i].industry].outstate);
            }
        }
        

        console.log(lookup);

        res.render('industrySummary', {
            lookup: lookup
        });
    });
});


module.exports = router;
