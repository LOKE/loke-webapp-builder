var errorBuilder = require('error-builder');

var AppBuilderError = exports.AppBuilderError = errorBuilder.create('AppBuilderError', 10001, 'App builder error');

exports.ValidationError = errorBuilder.create('ValidationError', 10100, 'Validation error', AppBuilderError);
exports.MissingOptionsError = errorBuilder.create('MissingOptionsError', 10200, 'Missing options parameter', AppBuilderError);
