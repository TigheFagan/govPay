var express = require('express');
var router = express.Router();
var request = require('request');
var JSONSelect = require('JSONSelect');
var mongoose = require('mongoose');
var CompanyModel = mongoose.model('companyModel');
var IndustryModel = mongoose.model('industryModel');

function translateLine(saoLineObj) {
    var transdate = saoLineObj[0]['f'];
    var type = saoLineObj[1]['v'];
    var totalAmount = saoLineObj[2]['v'];
    var lineAmount = saoLineObj[3]['v'];
    var vendorName = saoLineObj[4]['v'];
    var invoice = saoLineObj[5]['v'];
    var agency = saoLineObj[6]['v'];
    var desc = saoLineObj[7]['v'];
    var contact = saoLineObj[8]['v'];
    var doc = saoLineObj[9]['v'];
    
    var line = {
        "transdate": transdate , 
        "type": type ,
        "totalAmount": totalAmount ,
        "lineAmount": lineAmount ,
        "vendorName": vendorName,
        "invoice": invoice,
        "agency": agency,
        "desc": desc,
        "contact": contact,
        "doc": doc
    };
    
    return line;
}


function fillCompanyWithLine(companies, line) {
    var found = false;
    var i;
    if (companies.length > 0) {
        for (i = 0; i < companies.length; i++) {
            if (companies[i]['companyName'] === line['vendorName']) {
                found = true;
                break;
            }
        }
        if (found) {
            companies[i].lines.push(line);
        }
        else {
            companies.push({
                companyName: line['vendorName'], 
                industry: '', 
                inState: false,
                lines: [line]
            });
        }
    }
    else {
        companies.push({
            companyName: line['vendorName'], 
            industry: '', 
            inState: false,
            lines: [line]
        });
    };
}


router.get('/', function (req, res) {
    
    //var url = 'https://docs.google.com/spreadsheets/d/1pcfow84akQl7FzjM_xsAE_ovP6UpIXutzBfjkErDo3c/gviz/tq?tq=SELECT%20*%20WHERE%20(%20E%20LIKE%20upper(%27%25pascal%20public%25%27)%20OR%20E%20LIKE%20lower(%27%25pascal%20public%25%27)%20OR%20E%20LIKE%20(%27%25Pascal%20Public%25%27)%20)%20AND%20A%20%3E%3D%20date%20%272015-12-01%27&tqx=reqId%3A0';
    
    //var url = 'https://docs.google.com/spreadsheets/d/1pcfow84akQl7FzjM_xsAE_ovP6UpIXutzBfjkErDo3c/gviz/tq?tq=SELECT%20*%20WHERE%20(%20E%20LIKE%20upper(%27%25public%25%27)%20OR%20E%20LIKE%20lower(%27%25public%25%27)%20OR%20E%20LIKE%20(%27%25Public%25%27)%20)%20AND%20A%20%3E%3D%20date%20%272015-12-01%27&tqx=reqId%3A0';
    var url = 'https://docs.google.com/spreadsheets/d/1pcfow84akQl7FzjM_xsAE_ovP6UpIXutzBfjkErDo3c/gviz/tq?tq=SELECT%20*%20WHERE%20A%20%3E%3D%20date%20%272015-09-01%27&tqx=reqId%3A0';

    //var url = 'https://docs.google.com/spreadsheets/d/1pcfow84akQl7FzjM_xsAE_ovP6UpIXutzBfjkErDo3c/gviz/tq?tq=SELECT%20*%20WHERE%20(%20E%20LIKE%20upper(%27%25gannett%20peak%25%27)%20OR%20E%20LIKE%20lower(%27%25gannett%20peak%25%27)%20OR%20E%20LIKE%20(%27%25Gannett%20Peak%25%27)%20)%20AND%20A%20%3E%3D%20date%20%272015-12-01%27&tqx=reqId%3A0';
    
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var str2 = body.substring(47);
            var str3 = str2.substring(0, str2.length - 2);
            var jsonObj = JSON.parse(str3);
            
            var str4 = '';
            var companies = [];
            var selector = '.rows .c'; // xPath CSS like selector
            JSONSelect.forEach(selector, jsonObj, function (saoLineObj) {
                var line = translateLine(saoLineObj);
                fillCompanyWithLine(companies, line);
            });
            
            //console.log(JSON.stringify(companies, null, ' '));
            str4 = str4 + JSON.stringify(companies, null, ' ');

            for (var i = 0; i < companies.length; i++) {
                var company = companies[i];

                (function(company) {
                    CompanyModel.findOne({ 'companyName': company['companyName'] }, function(err, result) {
                        console.log(company['companyName']);
                        if (result) {
                            console.log(result['_id']);
                            var companyid = result['_id'];
                            console.log('found');
                            console.log(result['lines'].length);
                            var maxDate = new Date('1/1/1950');
                            for (var j = 0; j < result['lines'].length ; j++) {
                                var dateFound = result['lines'][j]['transdate'];
                                //console.log(dateFound);
                                if (dateFound > maxDate) {
                                    maxDate = dateFound;
                                }
                            }
                            
                            console.log('maxDate' + maxDate);
                            var isNewLineFound = false;
                            for (var k = 0; k < company.lines.length; k++) {
                                var newLine = company.lines[k];
                                var newLineDate = new Date(newLine.transdate);
                                //console.log('date found ' + newLineDate);

                                if (newLineDate > maxDate) {
                                    
                                    console.log('add this line with date:' + newLineDate);
                                    isNewLineFound = true;
                                    result['lines'].push(newLine);
                                }
                            }

                            if (isNewLineFound === true) {
                                console.log('all lines to update:' +  result['lines'].length);
                                CompanyModel.update({ '_id': companyid}, { lines: result['lines'] }, function (err, updateResult) {
                                    if (err) {
                                        console.log('update lines ERROR ' + err);
                                    } else {
                                        console.log('Saved:' + companyid);
                                    }
                                });
                            }
                        } else {
                            console.log(company);
                            console.log('not found');
                            var companyModel = new CompanyModel(company);
                            companyModel.save(function (saveErr) {
                                if (saveErr) {
                                    console.log(saveErr);
                                }
                            });
                        }
                    });
                }(company));
            }

//var db = req.db;
            //var company = db.get('company');
            //company.insert(companies);

            res.render('load', {
                str1: str4.length
            });
            
        }
    });
});


router.get('/calc', function (req, res) {
    CompanyModel.find({}, {}, {}, function (err, result) {
        console.log(err);
        var lookup = {};
        for (var i = 0; i < result.length; i++) {
            var company = result[i];
            console.log(company.companyName);
            var companyLines = company.lines;
            var totalAmount = 0;
            for (var j = 0; j < companyLines.length; j++) {
                totalAmount = totalAmount + companyLines[j].lineAmount;
            }
            
            if (lookup[result[i].industry] === undefined) {
                lookup[result[i].industry] = { inStateTotal: 0, outOfStateTotal: 0 };
            }
            if (result[i].inState) {
                lookup[result[i].industry].inStateTotal = lookup[result[i].industry].inStateTotal + totalAmount;
            } else {
                lookup[result[i].industry].outOfStateTotal = lookup[result[i].industry].outOfStateTotal + totalAmount;
            }

            
            console.log(totalAmount);
            CompanyModel.update({ '_id': company._id },
                { summaryAmount: totalAmount },
                function(err2, result2) {
                    if (err2) {
                        console.log('update lines ERROR ' + err2);
                    } else {
                        console.log('Save Company summaryAmount');
                    }
                });
        }
        
        for (var industry in lookup) {
            if (lookup.hasOwnProperty(industry)) {
                console.log(industry);
                console.log(lookup[industry].inStateTotal);
                console.log(lookup[industry].outOfStateTotal);

                (function(industry, lookup) {
                    IndustryModel.findOne({ 'industry': industry }, function (errIndustry, findOneResult) {
                        if (findOneResult) {
                            console.log('UPDATE');
                            console.log(findOneResult['_id']);
                            IndustryModel.update({ '_id': findOneResult['_id'] },
                            {
                                    industry: industry,
                                    inStateTotalAmount: lookup[industry].inStateTotal,
                                    outOfStateTotalAmount: lookup[industry].outOfStateTotal
                                },
                                function(err3, result3) {
                                    if (err3) {
                                        console.log('update lines ERROR ' + err3);
                                    } else {
                                        console.log('Saved industry Totals');
                                    }
                                });
                        } else {
                            console.log('INSERT');
                            console.log(industry);
                            console.log(lookup[industry].inStateTotal);
                            console.log(lookup[industry].outOfStateTotal);
                            var industryModel = new IndustryModel({
                                industry: industry, 
                                inStateTotalAmount: lookup[industry].inStateTotal,
                                outOfStateTotalAmount: lookup[industry].outOfStateTotal
                            });
                            industryModel.save(function(saveErr) {
                                if (saveErr) {
                                    console.log(saveErr);
                                }
                            });
                        }
                    });
                }(industry, lookup));
            }    
        }

        res.render('calc', {
            numberOfCompanies: result.length
        });

    });
});


module.exports = router;