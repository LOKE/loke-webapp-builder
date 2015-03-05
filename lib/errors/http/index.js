var errorBuilder = require('error-builder');

var HttpError = exports.HttpError = errorBuilder.create('HttpError', 500, 'Http error');

var HttpAppError = exports.HttpAppError = errorBuilder.create('HttpAppError', 400, 'Http application error', HttpError);
exports.BadRequest = errorBuilder.create('BadRequestError', 400, 'Bad request', HttpAppError);
exports.Unauthorized = errorBuilder.create('UnauthorizedError', 401, 'Not authorized to make this request', HttpAppError);
exports.PaymentRequired = errorBuilder.create('PaymentRequiredError', 402, 'Payment required', HttpAppError);
exports.Forbidden = errorBuilder.create('ForbiddenError', 403, 'Forbidden', HttpAppError);
exports.NotFound = errorBuilder.create('NotFoundError', 404, 'Resource not found', HttpAppError);

var HttpSysError = exports.HttpSysError = errorBuilder.create('HttpSysError', 500, 'Http system error', HttpError);
exports.InternalError = errorBuilder.create('InternalError', 500, 'Internal error', HttpSysError);
exports.NotImplemented = errorBuilder.create('NotImplementedError', 501, 'Not implemented', HttpSysError);
exports.Overloaded = errorBuilder.create('OverloadedError', 502, 'Temporarily overloaded', HttpSysError);
exports.GatewayTimeout = errorBuilder.create('GatewayTimeoutError', 503, 'Gateway timeout', HttpSysError);
