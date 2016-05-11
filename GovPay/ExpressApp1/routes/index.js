var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
console.log('inside index.js');

router.get('/', function (req, res) {
    res.render('index', {
        title: 'Wyoming Spending'
    });    
});

module.exports = router;