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
            const parsedResult = JSON.parse(result);
            if (parsedResult.access_token !== undefined) {
                const cernerCode = 4707;
                const accessToken = parsedResult.access_token;
                let loginURL = `https://quick.1up.health/connect/${cernerCode}?access_token=${accessToken}`
                res.send({redirectURL: loginURL});
            } else {
                res.send({redirectURL: "https://google.com"});
            }
        }
    })
})


app.listen(3000, function() {
    console.log("node is running")
});

