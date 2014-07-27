var with_media = true;

// Node requires
var https = require('https');
var crypto = require('crypto');

var twitterHandle = '@technicalhumans';

// The status to tweet
var status = 'Hello ' + 'Nodebots' + '. This is your #Tessel speaking.';
// Timestamp
var curtime = parseInt(process.env.DEPLOY_TIMESTAMP || Date.now());

// Copy your own keys here if you want
var oauth_consumer_key = "O7oc0pvsZn4xjgcuHuYdX4FaC";
var oauth_consumer_secret = "iJYuHFz2sD46Nvk3mcwzX8uih14aEAMgVWdWoR59nx8v6Zl7ZX";
var oauth_access_token = "2529232909-luARGU89K4CKFMvfzBjCgG6ubefzDkdDWkSB85i";
var oauth_access_secret = "GXQfuzvGdjLEs3t1HEYfhQ9x9bdBcSBVXjBkbRgwYlOE0";

// Set up OAuth
var oauth_data = {
  oauth_consumer_key: oauth_consumer_key,
  oauth_nonce: crypto.pseudoRandomBytes(32).toString('hex'),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: Math.floor(curtime / 1000),
  oauth_token: oauth_access_token,
  oauth_version: '1.0'
};
oauth_data.status = status;

if(with_media) {
  image = './picture-1.4064869585463e+15.jpg';
  oauth_data['media[]'] = "image";
  hostname = 'upload.twitter.com';
  postURL = 'https://upload.twitter.com/1/statuses/update_with_media.json';
} else {
  hostname = 'api.twitter.com';
  postURL = 'https://api.twitter.com/1.1/statuses/update.json';
}

var out = [].concat(
  ['POST', postURL],
  (Object.keys(oauth_data).sort().map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(oauth_data[k]);
  }).join('&'))
).map(encodeURIComponent).join('&');
delete oauth_data.status;
oauth_data.oauth_signature = crypto
  .createHmac('sha1', [oauth_consumer_secret, oauth_access_secret].join('&'))
  .update(out)
  .digest('base64');
var auth_header = 'OAuth ' + Object.keys(oauth_data).sort().map(function (key) {
  return key + '="' + encodeURIComponent(oauth_data[key]) + '"';
}).join(', ');

// Set up a request
var req = https.request({
  port: 443,
  method: 'POST',
  hostname: hostname,
  path: '/1.1/statuses/update.json',
  headers: {
    Host: hostname,
    'Accept': '*/*',
    "User-Agent": "tessel",
    'Authorization': auth_header,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Connection': 'keep-alive'
  }
}, function (res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.on('data', function(d) {
    console.log(' ');
    console.log(' ');
    console.log(String(d));
  });
});

// POST to Twitter
req.write('status=' + encodeURIComponent(status));
req.end();

// Log any errors
req.on('error', function(e) {
  console.error(e);
});