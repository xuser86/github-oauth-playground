const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const githubClientID = '';
const githubClientSecret = '';

const authorizeURL = 'https://github.com/login/oauth/authorize';
const tokenURL = 'https://github.com/login/oauth/access_token';
const apiURLBase = 'https://api.github.com/';
const baseURL = 'http://localhost:3000/';
const redirectURL = 'http://localhost:3000/callback';

function queryGitHub(reqSession) {
    headers['Accept'] = 'application/vnd.github.v3+json, application/json';
    headers['User-Agent'] = baseURL;

    if (reqSession['access_token']) {
        headers['Authorization'] = 'Bearer ' + reqSession['access_token'];
    }
}

function buildQuery(params) {
    let str = [];
    
    Object.keys(params).forEach((key) => {
        str.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    });

    return '?'+str.join('&');
}

const app = express();

app.use(bodyParser.json());
app.use(session({secret: 'Secret!234'}));

app.get('/', function(req, res, next) {
    if (req.query['action'] && req.query['action'] === 'error') {
        res.json(req.query);
    } else if (req.query['action'] && req.query['action'] === 'login') {
        delete req.session['access_token'];

        req.session['state'] = (Math.random() * Math.pow(10, 17)).toString(36);

        let url_params = buildQuery({
            'response_type' : 'code',
            'client_id' : githubClientID,
            'redirect_uri' : redirectURL,
            'scope' : 'user public_repo',
            'state' : req.session['state']
        });

        console.log('Authorize redirect: ', authorizeURL + url_params);

        res.redirect(authorizeURL + url_params);
    } else if (req.query['action'] && req.query['action'] === 'repos') {
        res.send('REPOS');
    } else if (req.query['action'] && req.query['action'] === 'logout') {
        res.send('LOGOUT');
    } else {
        if(req.session['access_token']) {
            res.send(
                '<h3>Logged In</h3>' +
                '<p><a href="?action=repos">View Repos</a></p>' +
                '<p><a href="?action=logout">Log Out</a></p>'
            );
        } else {
            res.send(
                '<h3>Not logged in</h3>' +
                '<p><a href="?action=login">Log In</a></p>'
            );
        }
    }
    
});

app.get('/callback', function(req, res, next) {
    res.json(req.query);
    /*if (req.query['code']) {
        if (!req.query['state'] || req.session['state'] !== req.query['state']) {
            res.redirect(baseURL + '?error=invalid_state');
        }
    }*/
});

app.listen(3000, function () {
    console.log('Listening on localhost:3000');
});

