HOW TO USE:
First, run server.js and navigate to localhost:3000. There are three text boxes and a "get everything" button.
If you do not have a user or want a new user, use the first text box (new user) and submit a username. Once you
have a user you'd like to use, enter the username in the second text box (user id) and submit it to receive a
user code (it will echo below the text box). Copy and paste that code into the third text box (code) and submit
it to be redirected via 1upHealth connect to Cerner login. Login to the test user (wilmasmart, Cerner01). You will
then be redirected to the app again, and now that you've logged in you may click the "get everything" button to 
retrieve this user's (wilma's) full medical data. It is presented in human-readable format using the patient's
resources' text fields within the returned JSON.

PRE-GIT REVISION HISTORY AND NOTES:
I admittedly made the mistake of getting ahead of myself and not documenting my code on Git.
The first commit came a few hours of work in to the project.
Noted here is a history of my iterative thought process and notes as to where things stand coming in.

As of the first commit, my project architecture consists of two halves: the server and the frontend HTML/JS.
The former is server.js and is responsible for sending curl requests to 1upHealth's APIs with user input.
The latter is index.html and is responsible for taking in user input, passing it to the server for processing,
    and returning the result in some fashion to the user.

Things to note about server.js:
    - uses exec() to run curl commands, not sure if there is a more elegant way but this works for now
    - has a separate app.post() for each potential action (e.g. get new user code, login to Cerner, etc.)
    - uses Express.js (which admittedly I'm not familiar with yet -- I'm just using its functionality)
    - able to create new users, get new codes for existing users, and connect to the Cerner health system
    - does not yet truly handle errors
Things to note about index.html:
    - uses ajax and jquery to send POST requests, as well as handle the responses
    - can take in user input to:
        * get a new code for an existing user, given a user id
        * connect to the Cerner health system, given a user code (code -> token happens on server.js)
    - sends and receives data in the form of JSON

A brief history of iterative thought process up to this point:
    - An early challenge was understanding how requests worked in the first place. I spent some time in curl and request
        documentations to learn the difference between POST and GET, what things like -X and -d mean, etc.
    - The biggest chunk of work so far has been figuring out how to send POST requests from the index.html front
        to the server.js back. This was centered around passing the user's input to server.js as data within a POST. 
        Initially, the only result was printing to the console log in server.js (e.g. when making a new code for an 
        existing user, it could only be accessed in the server console). Much of the hangup was due to unfamiliarity and
        a couple of obvious mistakes (we love those).
    - Another huge step was learning how to send responses back to the frontend, which can then be used to interact with
        the user in some way. This can be seen when the new code generated for an existing user shows up under the input bar.
        Also when the page redirects to the authenticated Cerner login page when a valid code is plugged in (note the url is
        pre-formatted with the Cerner code and auth token before redirection, no frontend work there).
    - Throughout this, my method of sending requests and getting responses on frontend has changed from XMLHTTPRequests to ajax
        (jquery). My switch to ajax was motivated by better documentation and ease of use (especially when it came to receiving
        responses from the server). The redirecting to the Cerner page was a big motivation for this -- it was an absolute pain
        because I kept trying to do redirection from server side, which turned out to be not very possible. Ajax was just simpler
        to understand and helped me understand the concept of bringing the redirection to the frontend to do via response.