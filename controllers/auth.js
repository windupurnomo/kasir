var pg = require('pg');
var helper = require('./helper');
var config = require('../config');
var sha1 = require('sha1');

var auth = {
    login: function(req, res) {
        pg.connect(config.db, function(err, client, done) {
            var q = 'select * from tbl_user where username = $1';
            client.query(q, [req.body.username], function(err, result) {
                done();
                if (err) {
                    res.setStatus = 403;
                    res.json({status: false, message: err});
                    return;
                }
                if (result.rows.length != 1) 
                    res.json({status: false, message: 'invalid username'});
                else if (result.rows[0].password !== sha1(req.body.password)) 
                    res.json({status: false, message: 'invalid password'});
                else {
                    var u = result.rows[0];
                    var token = helper.encodeToken(result.rows[0]);
                    delete u.password;
                    res.json({status: true, data: {user: u, token: token}});
                }
            });
        });
    },

    tryrequest: function (req, res){
        decodedToken: helper.decodeToken(req.body.token, function (err, decoded){
            if (err) res.json({status: false, message: err})
            else res.json({status: true, data: decoded});
        })
    },

    hash: function (req, res){
        res.json({
            plain: req.body.plain,
            hashed: helper.createHash(req.body.plain)
        })
    }
}

module.exports = auth;
