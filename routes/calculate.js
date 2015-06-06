var ctrl = require('../controllers/calculate');

module.exports = function(router) {
    router.get('/ordnum', ctrl.ordNum);
    return router;
};
