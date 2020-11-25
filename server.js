// TODO: 
// take usercode to get auth code
// plug authcode into cerner link (id 4707)
// log in with given test creds (wilmasmart, Cerner01)
// use the $everything query to get back a large json
// format the json for presentation to humans

// {"success":true,"code":"59c1057755531429844cead0039e45540045489b","oneup_user_id":123342385,"app_user_id":"test","active":true}
// {"access_token":"ec25098118a6e15b9bab613bc6bf1f566b1ac754","token_type":"Bearer","expires_in":3599,"refresh_token":"a09e7b8bbf7574d48c294f73f3ad739b6db6f827","scope":"user/*.*"}

const express = require("express");
const http = require("http");
const request = require("request");
const fs = require("fs");
const { exec } = require("child_process");

const clientID = "8c5d94b357db43f3a25b378144c01073";
const clientSecret = "m2cDmbw5BLA64FNTFXwa007rdxSNYsbc";

var app = express();

app.use(express.static(__dirname));
app.use(express.json()); 


app.post("/createUser", function(req, res) {
    let newID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user" -d "app_user_id=${newID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, result) => {
        if (error) {
            console.log(error)
        } else {
            console.log(result);
        }
    });
})

app.post("/newUserCode", function(req, res) {
    let userID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user/auth-code" -d "app_user_id=${userID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, result) => {
        if (error) {
            console.log(error)
        } else {
            const parsedResult = JSON.parse(result);
            res.send(parsedResult)
            console.log(result);
            // const proxyURL = "https://cors-anywhere.herokuapp.com/";
            // res.redirect(proxyURL + "http://google.com");
        }
    })
})

app.post("/getAuthTokens", function(req, res) {
    let code = req.body.code
    exec(`curl -X POST "https://api.1up.health/fhir/oauth2/token" -d "client_id=${clientID}" -d "client_secret=${clientSecret}" -d "code=${code}" -d "grant_type=authorization_code"`,
    (error, result) => {
        if (error) {
            console.log(error)
        } else {
            // TODO: redirect to login page with pre-created url using Cerner's 4707 id and the given auth token
            console.log(result);
            const parsedResult = JSON.parse(result);
            if (parsedResult.access_token !== undefined) {
                const cernerCode = 4707;
                const accessToken = parsedResult.access_token;
                let loginURL = `https://quick.1up.health/connect/${cernerCode}?access_token=${accessToken}`
                res.send({redirectURL: loginURL});
            } else {
                res.send({redirectURL: "https://google.com"});
            }
            // const proxyURL = "https://cors-anywhere.herokuapp.com/";
            // res.writeHead(301, 
            //     {Location: proxyURL+"https://www.google.com"}
            // );
            // res.end();

            // res.redirect(proxyURL + "https://google.com");
        }
    })
})


app.listen(3000, function() {
    console.log("node is running")
});

