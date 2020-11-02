const express = require('express');
const bodyParser = require('body-parser');
const cors = require('body-parser');
const path = require('path');

const app = express();

const port = process.env.PORT || 5000;


// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
/*
app.use((req, res, next) => {
    console.log(`Requset_Endpoint: ${req.method} ${req.url}`);

    next();
});
*/

app.get('/api/v1/say-somthing', (req, res) => {
    res.send({
        answer: "Hello also from the Server"
    });
});

// Configure the bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors());

// Require Route
const api = require('./routes/routes');
// Configure app to use route
app.use('/api/v1/', api);

// This middleware informs the express application to serve our compiled React files
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
};

// Catch any bad requests
app.get('*', (req, res) => {
    res.status(200).json({
        msg: 'Catch All'
    });
});


app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));