var ctrl = require('../controllers/auth.js');

module.exports = function(router) {
		/**
		@api {post} /login Login
		@apiName Login
		@apiGroup User

		@apiParam {String} username Username or email
		@apiParam {String} password	Plain password

		*/ 
    router.post('/login', ctrl.login);
    router.post('/hash', ctrl.hash);
    router.post('/tryrequest', ctrl.tryrequest);
    return router;
};
