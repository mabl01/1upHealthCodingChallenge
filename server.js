const express = require("express");
const { exec } = require("child_process");

const clientID = "8c5d94b357db43f3a25b378144c01073";
const clientSecret = "m2cDmbw5BLA64FNTFXwa007rdxSNYsbc";

var app = express();

app.use(express.static(__dirname));
app.use(express.json()); 

var accessToken = "";

// Creating a new user. Takes in an id in JSON form and creates a user with that id via
// 1upHealth's user management API. Sends back the data received, incl. id and user code.
app.post("/createUser", function(req, res) {
    let newID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user" -d "app_user_id=${newID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, stdout, stderr) => {
        if (error) {
            console.log(error)
        } else {
            const parsedResult = JSON.parse(stdout);
            res.send(parsedResult);
        }
    });
});

// Creating a new user code for an existing user. Takes in an id in JSON form and requests
// a new user code via 1up's user API. Sends back the data received, incl. the new user code.
app.post("/newUserCode", function(req, res) {
    let userID = req.body.id;
    exec(`curl -X POST "https://api.1up.health/user-management/v1/user/auth-code" -d "app_user_id=${userID}" -d "client_id=${clientID}" -d "client_secret=${clientSecret}"`,
    (error, stdout, stderr) => {
        if (error) {console.log(error);} else {
            const parsedResult = JSON.parse(stdout);
            res.send(parsedResult);
        }
    });
});

// Redirecting the user to the Cerner Health test system. Takes in a user code in JSON format,
// trades that code for an access token via 1up OAuth API, and uses the token to populate a
// user-custom link to access their Cerner Health system. Sends this link back to the requester.
app.post("/getAuthTokens", function(req, res) {
    let code = req.body.code
    exec(`curl -X POST "https://api.1up.health/fhir/oauth2/token" -d "client_id=${clientID}" -d "client_secret=${clientSecret}" -d "code=${code}" -d "grant_type=authorization_code"`,
    (error, stdout, stderr) => {
        if (error) {console.log(error);} 
        else {
            console.log(stdout);
            const parsedResult = JSON.parse(stdout);
            if (parsedResult.access_token !== undefined) {
                const cernerCode = 4707;
                const token = parsedResult.access_token;
                accessToken = token;
                let loginURL = `https://api.1up.health/connect/system/clinical/${cernerCode}?client_id=${clientID}&access_token=${token}`;
                res.send({redirectURL: loginURL, accessToken: token});
            } else {
                res.send({failure: "invalid user code"});
            }
        }
    });
});

app.get("/everything", function(req, res) {
    const token = accessToken;
    exec(`curl -X GET "https://api.1up.health/fhir/dstu2/Patient" -H "Authorization: Bearer ${token}"`,
    (error, stdout, stderr) => {
        if (error) {console.log(error);}
        const urlPrefix = "https://api.1up.health/dstu2/Patient/";
        const parsedResult = JSON.parse(stdout);
        const patientUrl = parsedResult.entry[0].fullUrl;
        const patientID = patientUrl.substring(urlPrefix.length);

        exec(`curl -X GET "https://api.1up.health/fhir/dstu2/Patient/${patientID}/$everything" -H "Authorization: Bearer ${token}"`,
        (error, stdout, stderr) => {
            if (error) {console.log(error);}
            else {
                const everything = JSON.parse(stdout);

                var allData = "";
                everything.entry.forEach(element => {
                    allData += element.resource.text.div;
                    allData += `<div><p>----------------------------</p></div>`
                });

                console.log(allData);
                res.send({pID: patientID, all: allData});
            }
        });
    });
})

// node is always listening. always. there is no escape
app.listen(3000, function() {
    console.log("node is listening")
});

