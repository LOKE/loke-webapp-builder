exports.apiRootControllerHandlers = function (opts) {
	var handlers = exports.apiSubControllerHandlers(opts);

	var sysErrLogger = opts.sysErrLogger || opts.errorLogger || null;
	handlers.push(require('./api-syserrors')(sysErrLogger));
	return handlers;
};

exports.apiSubControllerHandlers = function (opts) {
	var customLogger = opts.customLogger || opts.errorLogger || null;
	var appErrLogger = opts.appErrLogger || opts.errorLogger || null;
	var BaseAppError = opts.BaseAppError;
	var customHandlers = opts.errorHandlers;

	return [
		require('./api-custom')(customHandlers, customLogger),
		require('./api-apperrors')(BaseAppError, appErrLogger),
	];
};
