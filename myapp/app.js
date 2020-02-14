// File: app.js
var express = require('express');
var app = express();  // Init an Express object.
app.get('/', function (req, res) { // Set page-gen fcn for URL root request.
    res.send('Hello World! a test'); // Send webpage containing "Hello World!".
    res.send('this is me!'); // Send webpage containing "Hello World!".
    //console.log("test the console log function");
});
app.listen(3000, function () { // Set callback action fcn on network port.
    console.log('App.js listening on port 3000!');
});
