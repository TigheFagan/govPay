var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var CompanyModel = mongoose.model('companyModel');


/* GET users listing. */
router.get('/', function (req, res) {
    res.render('search', {
        
    });
});

router.get('/searchResults', function (req, res) {
    var filterValue = req.query.companyName;
    
    console.log(filterValue);
    CompanyModel.find({ 'companyName' : new RegExp(filterValue, 'i') }, function (err, queryResult) {
        console.log(queryResult);
        var resultString = JSON.stringify(queryResult);

        res.render('searchResults', {
            compName : resultString,
            compList : queryResult
        });
    });
});

function compareLinesByDate(a, b) {
    if (a.transdate < b.transdate)
        return 1;
    else if (a.transdate > b.transdate)
        return -1;
    else
        return 0;
}

router.get('/companyList', function (req, res) {
    CompanyModel.find({}, 'companyName', { sort: { companyName: 1 }, limit: 1000 }, function (err, result) {
        console.log(err);
        console.log(result);
        res.render('companyList', {
            companyNames : result
        }); 
    });
});




router.get('/companyDetail', function (req, res) {
    CompanyModel.findOne({ '_id' : req.query.id}, function (err, result) {
        console.log(result);
        result.lines.sort(compareLinesByDate);
        res.render('companyDetail', {
            company : result
        }); 
    });
});

router.get('/topAmount', function(req, res) {
    CompanyModel.find({}, 'companyName', { sort: { summaryAmount: -1 }, limit: 1000 }, function (err, result) {
        console.log(err);
        console.log(result);
        res.render('companyList', {
            companyNames : result
        });
    });
});



module.exports = router;