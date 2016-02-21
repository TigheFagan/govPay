var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var CompanyModel = mongoose.model('companyModel');


router.get('/saveCompany', function (req, res) {
    console.log('inside company:saveCompany()');
    console.log(req.query.companyID);
    console.log(req.query.industry);
    console.log(req.query.inState);
    CompanyModel.update({ '_id': req.query.companyID }, { industry: req.query.industry, inState: req.query.inState === "true" ? true : false}, function (err, updateResult) {
        res.send('Company Saved.');
    });
});

module.exports = router;