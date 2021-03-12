import { capitalize, safeAssign } from '../tools';
import { CUIField } from './fields';

export class CUIError extends Error {
  public code: number;
  constructor(message, code = 500) {
    super(message);
    this.code = code;
  }
}

export class CUICSRFError extends CUIError {
  constructor() {
    super('Invalid or missing CSRF token. Reload and try again', 403);
  }
}

export class CUIActionNotSupportedError extends CUIError {
  public action: string;
  constructor(action) {
    super(`Action "${action}" is not supported`, 500);
    this.action = action;
  }

  static assert(handlers, op) {
    if (typeof handlers[op] !== 'function') {
      throw new CUIActionNotSupportedError(op);
    }
  }
}

// *********************************************************************************************************************

export class CUIValidationFault {
  /**
   * Short error message, excluding key name
   */
  public message: string = undefined;

  /**
   * Field for which this error is
   */
  public field: CUIField = undefined;

  /**
   * Value that was validated
   */
  public value: any = undefined;

  constructor(source?: Partial<CUIValidationFault>) {
    safeAssign(this, source);
  }

  get fullMessage() {
    return capitalize(this.field.title) + ' ' + this.message;
  }

  static cast(x) {
    return x instanceof CUIValidationFault ? x : new CUIValidationFault(x);
  }
}

export class CUIValidationError extends CUIError {
  public faults: CUIValidationFault[];
  public byFieldName: { [fieldName: string]: CUIValidationFault[] };
  public payload: any;

  constructor(faults: CUIValidationFault[], payload) {
    let message;
    if (!faults || !faults.length) {
      message = 'Validation error';
      faults = [];
    } else if (typeof faults === 'string') {
      message = faults;
      faults = [];
    } else if (faults.length === 1) {
      message = `Validation error: ${faults[0].fullMessage}`;
    } else {
      message = `${faults.length} validation errors`;
    }
    super(message, 400);

    this.faults = faults.map(f => CUIValidationFault.cast(f));

    this.byFieldName = this.faults.reduce((lookup, fault) => {
      lookup[fault.field.name] = lookup[fault.field.name] || [];
      lookup[fault.field.name].push(fault);
      return lookup;
    }, {});

    this.payload = payload;
  }
}
