var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
console.log('inside index.js');

router.get('/', function (req, res) {
    res.render('index', {
        title: 'WY Gov Pay'
    });    
});

module.exports = router;