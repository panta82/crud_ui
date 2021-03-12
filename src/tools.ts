import * as libPluralize from 'pluralize';

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function uncapitalize(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function pluralize(str: string) {
  return libPluralize(str);
}

export function singularize(str: string) {
  return libPluralize.singular(str);
}

/**
 * Take a slug-like string ("string_with_things") and convert it into a conversational string ("string with things")
 */
export function deslugify(str: string) {
  let firstWord = true;
  return str
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z]+|[A-Z]?[a-z]+)(?=[A-Z]|\b)/g, x => {
      if (firstWord) {
        firstWord = false;
      } else {
        x = x.toLowerCase();
      }
      return x + ' ';
    })
    .trim();
}

/**
 * Generate a random string token
 */
export function randomToken() {
  return (
    Math.random()
      .toString(32)
      .slice(2) +
    Math.random()
      .toString(32)
      .slice(2)
  );
}

// *********************************************************************************************************************

export function assertEqual<T>(value: T, expected: T, identifier = 'value') {
  if (value !== expected) {
    throw new TypeError(`Expected ${identifier} to be "${expected}", instead got "${value}"`);
  }
}

export function assertProvided(value, identifier) {
  if (value === undefined) {
    throw new TypeError(`${identifier} must be provided`);
  }
}

type IAssertableType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'array';
export function assertType(value, identifier = 'Type', ...types: IAssertableType[]) {
  if (value === undefined) {
    // Pass through undefined, use assertProvided for those
    return;
  }
  const t = typeof identifier;

  const actual = Array.isArray(value) ? 'array' : typeof value;

  if (!types.includes(actual)) {
    throw new TypeError(
      `${identifier} must be ${types.join(' or ')}. Instead, we were given "${actual}"`
    );
  }
}

export function assertMember(value, hash, identifier = 'Value') {
  if (!(value in hash)) {
    const keys = Object.keys(hash).map(k => '"' + k + '"');
    let keysStr;
    if (keys.length <= 1) {
      keysStr = keys[0];
    } else {
      keysStr =
        'one of ' + keys.slice(0, keys.length - 1).join(', ') + ' or ' + keys[keys.length - 1];
    }
    throw new TypeError(`${identifier} must be ${keysStr}. Instead, we were given "${value}"`);
  }
}

export function makeObjectAsserters<T>(
  object: T,
  identifierPrefix = 'Key "',
  identifierSuffix = '"'
) {
  return {
    provided(key: keyof T) {
      return assertProvided(object[key], identifierPrefix + key + identifierSuffix);
    },
    type(key: keyof T, ...types: IAssertableType[]) {
      return assertType(object[key], identifierPrefix + key + identifierSuffix, ...types);
    },
    member(key: keyof T, hash: object) {
      return assertMember(object[key], hash, identifierPrefix + key + identifierSuffix);
    },
  };
}

// *********************************************************************************************************************

export function isObject(val) {
  return !!val && typeof val === 'object' && !Array.isArray(val);
}

/**
 * If val is function, call it with args and return the result. Otherwise, just return the val.
 * This is used for function-or-literal pattern for some options.
 */
export function getOrCall<T extends Exclude<any, (...args) => any>, TArgs extends any[]>(
  val: T | ((...args: TArgs) => T),
  ...args: TArgs
) {
  if (typeof val === 'function') {
    return (val as any)(...args);
  }
  return val;
}

/**
 * Ensure string start swith leading char
 */
export function ensureLeadingChar(leadingChar: string, str) {
  return typeof str === 'string' && str[0] !== leadingChar ? leadingChar + str : str;
}

/**
 * Cast an object into a constructor
 */
export function cast<T>(Ctr: new (...args) => T, ob): T {
  if (ob instanceof Ctr) {
    return ob;
  }
  return new Ctr(ob);
}

/**
 * Generates a javascript "enum", like {x: 'x', y: 'y'}. We are doing it like this so it will be treated as const by ts
 * and we can generate a set of its keys.
 */
export function enumize<T extends string>(
  arrayOfAllPossibleValues: readonly T[]
): { [key in T]: key } {
  const result = {};
  for (const item of arrayOfAllPossibleValues) {
    result[String(item)] = String(item);
  }
  return result as any;
}

/**
 * Wrapper around Object.keys() that keeps typescript types
 */
export function enumValues<T extends { [key: string]: any }>(target: T): Array<keyof T> {
  return Object.keys(target) as Array<keyof T>;
}

/**
 * Shortcut to .hasOwnProperty() that's a bit safer (works for objects without prototype)
 */
export function hasOwnProperty(target, property): boolean {
  return Object.prototype.hasOwnProperty.call(target, property);
}

/**
 * Assign only properties that already exist on the target and that are not undefined
 */
export function safeAssign<T extends { [key: string]: any }>(
  target: T,
  ...sources: Array<Partial<T> | T>
): T {
  3;
  if (sources) {
    for (const source of sources) {
      if (source) {
        for (const key in source) {
          if (
            hasOwnProperty(source, key) &&
            hasOwnProperty(target, key) &&
            source[key] !== undefined
          ) {
            (target[key] as any) = source[key];
          }
        }
      }
    }
  }
  return target;
}

// *********************************************************************************************************************

/**
 * Escape an arbitrary text into a form that can appear inside HTML.
 */
export function escapeHTML(str: string): string {
  return String(str).replace(/[&<>"']/g, m => escapeHTML.MAP[m]);
}
escapeHTML.MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

/**
 * Escape javascript code so that it can safely be embedded in a <script> tag.
 * https://stackoverflow.com/questions/14780858/escape-in-script-tag-contents
 */
export function escapeScript(script) {
  return script ? script.replace(/<\/script/gm, '</scri\\pt') : '';
}

/**
 * Extract cookie value from a cookie header value (eg. "a=b; c=d"). Returns null if nothing is found.
 */
export function extractCookie(cookieStr: string, cookieName: string): string | null {
  if (!cookieStr) {
    return null;
  }

  let startIndex = cookieStr.indexOf(cookieName);
  if (startIndex < 0) {
    return null;
  }

  while (cookieStr[startIndex] !== '=' && startIndex < cookieStr.length) {
    startIndex++;
  }
  startIndex++;
  let endIndex = startIndex;
  while (cookieStr[endIndex] !== ';' && endIndex < cookieStr.length) {
    endIndex++;
  }
  const value = cookieStr.slice(startIndex, endIndex);
  return value;
}
