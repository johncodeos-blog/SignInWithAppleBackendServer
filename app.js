require('dotenv').config()

const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');

const getClientSecret = () => {

  const time = new Date().getTime() / 1000; // Current time in seconds since Epoch
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_FILE);

  const headers = {
    kid: process.env.KEY_ID,
    typ: undefined
  }

  const claims = {
    'iss': process.env.TEAM_ID,
    'iat': time, // The time the token was generated
    'exp': time + 86400 * 180, // Token expiration date
    'aud': 'https://appleid.apple.com',
    'sub': process.env.SERVICE_ID,
  }

  token = jwt.sign(claims, privateKey, {
    algorithm: 'ES256',
    header: headers
  });

  return token
}

app.post('/callback', bodyParser.urlencoded({
  extended: true
}), (req, res) => {
  if (res.statusCode == 200) {
    var returnURL = ""
    var firstName = ""
    var middleName = ""
    var lastName = ""
    var email = ""
    if (req.body.hasOwnProperty('user')) {
      const userdata = req.body.user
      const user = JSON.parse(userdata)
      firstName = '&first_name=' + user.name['firstName']
      middleName = '&middle_name=' + user.name['middleName']
      lastName = '&last_name=' + user.name['lastName']
      email = '&email=' + user.email
    }

    var code = '&code=' + req.body.code
    var clientSecret = '&client_secret=' + getClientSecret()
    returnURL = '?success=true' + code + clientSecret + firstName + middleName + lastName + email
    res.redirect(returnURL)
  } else {
    res.redirect('?success=false')
  }
})

var port = process.env.PORT;
app.listen(port, () => console.log(`Your app is listening on port ` + port + '.'))