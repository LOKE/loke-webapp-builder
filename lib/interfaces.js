/**
 * Retrieves session information from a request
 * @interface sessionManager
 *
 * @method getSession
 *         @returns {Session} session information
 */

/**
 * Error handler for a request
 * @interface errorHandler
 *
 * @method handleError
 * @param {Error} err - The error to handle
 */

/**
 * Defines a user session
 * @interface
 *
 * @method authorize - Authorize a request. Throws an error if failed.
 * @throws {AuthorizationFailedError} If the auth request fails.
 */

/**
 * Options for a Controller
 * @interface
 *
 * @field {Boolean} domain - If true a domain & correlation ID will be created for each request
 */