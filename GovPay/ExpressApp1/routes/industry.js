var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var CompanyModel = mongoose.model('companyModel');


router.get('/', function(req, res) {
    var industryID = req.query.id;
    CompanyModel.find( { industry: industryID }, {}, { sort: { summaryAmount: -1 }, limit: 1000 },
        function(err, result) {
            console.log(err);
        
            res.render('industryDetail', {
                companies: result
            });
        });
});

router.get('/summary', function(req, res) {
    CompanyModel.find({}, { industry: 'industry', summaryAmount: 'summaryAmount', inState: 'inState' }, {}, function (err, result) {
        console.log(err);
        var lookup = {};
        for (var i = 0; i < result.length; i++) {
            //console.log("from DB: " + result[i].industry + " " + result[i].summaryAmount + ' ' + lookup[result[i].industry]);
            if (lookup[result[i].industry] !== undefined) {
                //console.log("1 " + lookup[result[i].industry].total);
                //console.log("2 " + result[i].summaryAmount);
                lookup[result[i].industry].total = lookup[result[i].industry].total + result[i].summaryAmount;
                if (result[i].inState) {
                    lookup[result[i].industry].instate = lookup[result[i].industry].instate + result[i].summaryAmount;
                } else {
                    lookup[result[i].industry].outstate = lookup[result[i].industry].outstate + result[i].summaryAmount;
                }
                lookup[result[i].industry].instatepercent = (lookup[result[i].industry].instate / lookup[result[i].industry].total * 100).toFixed(2);
                lookup[result[i].industry].outstatepercent = (lookup[result[i].industry].outstate / lookup[result[i].industry].total * 100).toFixed(2);
            } else {
                //console.log('reset');
                lookup[result[i].industry] = { total: 0, instate: 0, outstate: 0, instatepercent: 0, outstatepercent: 0 };
            }
            if (result[i].industry !== "") {
                console.log('------------------');
                console.log(result[i].industry + " " + lookup[result[i].industry].total + " " +
                    lookup[result[i].industry].instate + " " + lookup[result[i].industry].outstate);
            }
        };

        console.log(lookup);

        res.render('industrySummary', {
            lookup: lookup
        });
    });
});


module.exports = router;
