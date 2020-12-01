const express = require("express");
const { exec } = require("child_process");

const clientID = "8c5d94b357db43f3a25b378144c01073";
const clientSecret = "m2cDmbw5BLA64FNTFXwa007rdxSNYsbc";

var app = express();

app.use(express.static(__dirname));
app.use(express.json()); 

// Creating a new user. Takes in an id in JSON form and creates a user with that id via
// 1upHealth's user management API. Sends back the data received, incl. id and user code.
app.post("/createUser", function(req, res) {
    let newID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user" -d "app_user_id=${newID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, result) => {
        if (error) {
            console.log(error)
        } else {
            const parsedResult = JSON.parse(result);
            res.send(parsedResult);
            // if (parsedResult.success == "true") {
            //     res.send(parsedResult);
            // } else {
            //     console.log(parsedResult);
            //     res.send({failure: "invalid"});
            // }
        }
    });
})

// Creating a new user code for an existing user. Takes in an id in JSON form and requests
// a new user code via 1up's user API. Sends back the data received, incl. the new user code.
app.post("/newUserCode", function(req, res) {
    let userID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user/auth-code" -d "app_user_id=${userID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, result) => {
        if (error) {
            console.log(error)
        } else {
            const parsedResult = JSON.parse(result);
            res.send(parsedResult);
            // if (parsedResult.code != undefined) {
            //     res.send(parsedResult);
            // } else {
            //     console.log(parsedResult);
            //     res.send({failure: "invalid username"});
            // }
        }
    })
})

// Redirecting the user to the Cerner Health test system. Takes in a user code in JSON format,
// trades that code for an access token via 1up OAuth API, and uses the token to populate a
// user-custom link to access their Cerner Health system. Sends this link back to the requester.
app.post("/getAuthTokens", function(req, res) {
    let code = req.body.code
    exec(`curl -X POST "https://api.1up.health/fhir/oauth2/token" -d "client_id=${clientID}" -d "client_secret=${clientSecret}" -d "code=${code}" -d "grant_type=authorization_code"`,
    (error, result) => {
        if (error) {
            console.log(error);
        } else {
            const parsedResult = JSON.parse(result);
            if (parsedResult.access_token !== undefined) {
                const cernerCode = 4707;
                const accessToken = parsedResult.access_token;
                let loginURL = `https://quick.1up.health/connect/${cernerCode}?access_token=${accessToken}`
                res.send({redirectURL: loginURL});
            } else {
                res.send({failure: "invalid user code"});
            }
        }
    })
})

// node is always listening. always. there is no escape
app.listen(3000, function() {
    console.log("node is listening")
});

