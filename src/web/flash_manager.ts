import { extractCookie, randomToken } from '../tools';
import { ICUIExtendedRequest, ICUIFlash, IDebugLogFunction } from '../types/definitions';
import { Response } from 'express';

export type IFlashManager = ReturnType<typeof createFlashManager>;

/**
 * Use cookies to provide "flash message" functionality
 */
export function createFlashManager(
	cookieName: string,
	maxAge: number,
	debugLog: IDebugLogFunction
) {
	const _flashes = new Map<string, { data: ICUIFlash; timestamp: Date }>();

	return {
		_flashes,

		middleware,
		setFlash,
	};

	function cleanOldFlashes() {
		const now = Date.now();
		for (const [key, { timestamp }] of _flashes.entries()) {
			if (now - timestamp.valueOf() > maxAge) {
				// Delete outdated flash
				_flashes.delete(key);
				debugLog(`Cleaned outdated flash "${key}"`);
			}
		}
	}

	/**
	 * Extract flash object from request and set it to req.flash
	 */
	function middleware(req: ICUIExtendedRequest, res: Response, next) {
		const key = extractCookie(req.headers.cookie, cookieName);
		if (!key) {
			// No flash message
			return next();
		}

		const entry = _flashes.get(key);

		_flashes.delete(key);
		res.clearCookie(cookieName);

		if (entry) {
			req.flash = entry.data;
			debugLog(`Consumed flash "${key}"`);
		}

		return next();
	}

	/**
	 * Set given object as a one-time flash, which will appear next time the same client calls back.
	 * Useful for redirects.
	 */
	function setFlash(res: Response, data: ICUIFlash) {
		cleanOldFlashes();

		const flashKey = randomToken();
		_flashes.set(flashKey, { data, timestamp: new Date() });
		debugLog(`Set flash "${flashKey}": ${JSON.stringify(data)}`);

		res.cookie(cookieName, flashKey, {
			httpOnly: true,
			sameSite: true,
			// NOTE: We are not setting path here because we want all crudUI routers to share flashes
		});
	}
}
