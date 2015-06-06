var pg = require('pg');
var helper = require('./helper');
var config = require('../config');

var o = {
    main: function(req, res) {

    },

    component: function(req, callback) {
        //param: model, skala, 
        //
    },
    
    ordNum: function (req, res){
    	pg.connect(config.db, function(err, client, done) {
    	    client.query('select * from podes_2011 limit 1', [], function (err, result){
    	        done();
                o.sub(result, function (x){
                    res.json(x);
                });
    	        //helper.stdResponse(err, result.fields, res);
    	    });
    	});
    },

    sub: function (result, callback){
        console.log(result.fields.length);
        var res = [];
        //0 s.d. 100
        //100 s.d. 200
        //200 s.d. 300
        //300 s.d. 400
        //400 s.d. 500
        //500 s.d. 574
        pg.connect(config.db, function(err, client, done) {
            var start = 500;
            var stop = 574;
            for (var i = start; i < stop; i++) {
                console.log(i + " to " + start);
                var field = result.fields[i].name;
                var q = "select '"+field+"' as field, max(" + field + ") as max, min(" + field + ") as min from podes_2011";
                client.query(q, [], function (e, r){
                    done();
                    var o = {};
                    if (r == undefined) o = {error: e};
                    else{
                        var x = r.rows[0].max - r.rows[0].min;
                        var ordnum = x <= 10 ? 'ORDINAL' : 'NUMERIK';
                        o = {field: r.rows[0].field, type: ordnum};
                    }
                    // else o = {field: r.rows[0].field, data: r.rows[0].max - r.rows[0].min};
                    res.push(o);
                    if (res.length == stop-start) callback(res);
                    // if (res.length == 4) {
                    //     callback(res);
                    //     return;
                    // }
                })
            };
        });
    }


}

module.exports = o;
