var app = {
	page: 1,
};

module.exports = {
	appName         : 'Kasir',
	port            : process.env.PORT || 3008,
	db              : 'postgres://postgres:Ccrom2015@localhost/sidik',
	mongodb         : 'mongodb://sidik:Ccrom2015@localhost/sidik',
	jwt_key         : 'zenkinanti',
	isExpiring      : false,
	app             : app
};