var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var IndustryModel = mongoose.model('industryModel');

router.get('/industry', function (req, res) {

    IndustryModel.find({}, {}, { sort: { sortOrder: 1 }}, function(err, result) {
        console.log(err);
        var industries = [];
        for (var i = 0; i < result.length; i++) {
            if (result[i].industry !== "") {
                var totalAmount = result[i].inStateTotalAmount + result[i].outOfStateTotalAmount;
                console.log(totalAmount);
                var instatepercent = (result[i].inStateTotalAmount / totalAmount * 100).toFixed(2) / 1;
                console.log(instatepercent);
                var outstatepercent = (result[i].outOfStateTotalAmount / totalAmount * 100).toFixed(2) / 1;
                console.log(outstatepercent);
                industries.push({
                    title: result[i].label,
                    url: "industry?id=" + result[i].industry,
                    icon: result[i].icon,
                    data: [
                        {
                            label: 'In State',
                            count: result[i].inStateTotalAmount
                        },
                        {
                            label: 'Out of State',
                            count: result[i].outOfStateTotalAmount
                        }
                    ]
                });
            }
        }

        res.json(industries);
    });
});

module.exports = router;