var ctrl = require('../controllers/admin.js');

module.exports = function(router) {
    router.post('/sync', ctrl.sync);
    router.get('/transactions', ctrl.all);
    router.get('/margin', ctrl.margin);
    router.get('/topsell', ctrl.topSell);
    router.get('/topmargin', ctrl.topMargin);
    return router;
};
