var pg = require('pg');
var bCrypt = require('bcrypt-nodejs');
var config = require('../config');
var jwt = require("jsonwebtoken");

var h = {
    authorize: function(req, res, next) {
        var bearerToken;
        var decoded;
        var token = req.headers["authorization"];
        var anonim = ['post:/login'];
        if (0 == anonim.indexOf(req.method.toLowerCase()+':'+req.url.toLowerCase())) {
            next();
            return;
        }
        h.decodeToken(token, function(err, decodedToken){
            if (decodedToken == undefined){
                res.setStatus = 401;
                res.json({status: false, message: 'Anda tidak berhak mengakses servis ini'});
                return;
            }
            req.body.currentUser = decodedToken;
            pg.connect(config.db, function(err, client, done) {
                var q = 'select * from tbl_user where username = $1 and password = $2';
                console.log('test')
                client.query(q, [decodedToken.username, decodedToken.password], function(err, result) {
                    if (err) {
                        res.setStatus = 400;
                        res.json({status: false, message: err});
                        return;
                    }
                    done();
                    if (result.rows.length == 1) {
                        next();
                    }else{
                        res.setStatus = 401;
                        res.json({status: false, message: 'Anda tidak berhak mengakses servis ini'});
                        return;
                    }
                });
            });
            return;
        });
    },

    encodeToken: function (obj){
        var opt = {expiresInMinutes: 1}
        if (config.isExpiring)
            return jwt.sign(obj, config.jwt_key, opt);
        else
            return jwt.sign(obj, config.jwt_key);
    },

    decodeToken: function (token, callback){
        jwt.verify(token, config.jwt_key, function (err, decoded){
            callback(err, decoded);
        });
    },
    
    decodeTokenSync: function (token){
        try {
            var decoded = jwt.verify(token, config.jwt_key);
            delete decoded.password;
            return decoded;
        } catch (err) {
            return null;
        }
    },
    
    getAuthUser: function (token){
        var user = h.decodeTokenSync(token);
        if(user)
            return user;
        else
            return {id_user: 0};
    },

    refreshToken: function (token, callback) {
        var self = this;
        self.decodeToken(token, function (err, decoded){
            delete decoded.iat;
            delete decoded.exp;
            callback(err, self.encodeToken(decoded));
        });
    },

    handleDbError: function(err, client, done, res) {
        if (err) {
            res.setStatus = 403;
            res.json({status: false, message: err});
            return false;
        }
        done(client);
        return true;
    },

    stdQuery: function (req, res, sql, params, isSingle) {
        var self = this;
        pg.connect(config.db, function(err, client, done) {
            if (!isSingle){
                var x = sql.toLowerCase();
                var replaced = x.substring("select".length, x.indexOf("from"));
                var s = x.replace(replaced, " count(*) ");
                if(s.indexOf("order by") > 0) s = s.substring(0, s.indexOf("order by"));
                client.query(s, params, function (e, result){
                    done();
                    var n = result.rows[0].count;
                    res.set('totalItem', n);
                });
                if (req.query.limit !== undefined){
                    var limit = req.query.limit;
                    sql += " LIMIT " + limit;
                    if (req.query.page !== undefined){
                        var page = req.query.page;
                        var offset = (page - 1) * limit;
                        sql += " OFFSET " + offset;
                    }
                }
            }
            client.query(sql, params, function(e, result) {
                done();
                e = e ? 'Error running query' : e;
                if(result.rowCount === 0) {
                    self.stdResponse("Data not found", [], res);
                }
                if (isSingle) {
                    delete result.rows[0].password;
                    self.stdResponse(e, result ? result.rows[0] : null, res);
                }
                else {
                    result.rows.forEach(function (r){
                        delete r.password;
                    });
                    self.stdResponse(e, result ? result.rows : null, res);
                }
            });
        });
    },

    getPage: function (req) {
        var page = req.query.page ? req.query.page : config.app.page;
        if (isNaN(parseInt(page))) page = config.app.page;
        return page;
    },

    getLimit: function (req) {
        var limit = req.query.limit ? req.query.limit: config.app.limit;
        if (isNaN(parseInt(limit))) limit = config.app.limit;
        return limit;
    },

    stdResponse: function(error, data, res) {
        if (error) res.json({
            status: false,
            message: error
        });
        else res.json({
            status: true,
            data: data
        });
    },
    
    stdError: function(error, res) {
        res.json({
            status: false,
            message: error
        });
    },

    comparePassword: function(hashedPassword, plainPassword) {
        return bCrypt.compareSync(plainPassword, hashedPassword);
    },

    createHash: function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    },

    createRandomNum: function(n) {
        var text = "";
        var possible = "0123456789";
        for (var i = 0; i < n; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },

    createRandomAlphaNum: function(n) {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < n; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

};

module.exports = h;


function getRequestURL(url, modules) {
    for (var i = 0; i < modules.length; i++) {
        if (url.indexOf(modules[i]) > -1) return
        modules[i];
    }
    return null;
}
