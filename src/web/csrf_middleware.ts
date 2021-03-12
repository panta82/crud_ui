import { ICUIRequestHandler, IDebugLogFunction } from '../types/definitions';

const { extractCookie, randomToken } = require('../tools');
const { CUICSRFError } = require('../types/errors');

/**
 * Middleware that generates and checks CSRF tokens
 */
export function createCSRFMiddleware(
  fieldName: string,
  cookieName: string,
  debugLog: IDebugLogFunction
): ICUIRequestHandler {
  /**
   * Extract CSRF token from request and store it in req. Check its validity if there is a form body.
   */
  return function csrfMiddleware(req, res, next) {
    // Extract CSRF session
    let csrf = extractCookie(req.headers.cookie, cookieName);

    // Check that CSRF is present in case we have a body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      const submittedCSRF = req.body[fieldName];
      if (!csrf || !submittedCSRF || csrf !== submittedCSRF) {
        // Invalid CSRF
        return next(new CUICSRFError());
      }
    }

    // If csrf is not present, set it now
    if (!csrf) {
      csrf = randomToken();
      res.cookie(cookieName, csrf, {
        httpOnly: true,
        sameSite: true,
        // NOTE: We are not setting path here because we can reuse the same cookie
      });
      debugLog(`CSRF set to "${csrf}" for ${req.baseUrl}`);
    }

    // Tell services downstream what csrf token to use
    req.csrfToken = csrf;

    return next();
  };
}
