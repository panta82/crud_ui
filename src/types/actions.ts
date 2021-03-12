import { ICUIMode } from './consts';
import { makeObjectAsserters, safeAssign } from '../tools';
import { CUIContext } from './context';
import { PromiseOrNot } from './definitions';

/**
 * Functions to execute different supported CRUD operations.
 * User must supply these functions for the CMS to work.
 */
export class CUIActions<T> {
  /**
   * Produce list of items to be edited. If this is provided, main view will be a table with these items.
   */
  public getList: (ctx: CUIContext) => Promise<T[]> | T[] = undefined;

  /**
   * Get single item for edit view. It will be called with record id,
   * and should return either an object or null, if none is found.
   * If operating in single record mode, id will be left out.
   */
  public getSingle: (ctx: CUIContext, id?) => Promise<T> | T = undefined;

  /**
   * Create a new record with given payload. If not provided, creation will be disabled.
   * To display a flash message, return either a string or created record.
   * If this is not provided, UI will not show Create button.
   */
  public create: (ctx: CUIContext, payload: Partial<T>) => PromiseOrNot<T | string> = undefined;

  /**
   * Update the record with given id. It will be called with a record id and update payload.
   * If not provided, editing will be disabled.
   * To display a flash message, return either a string or updated record.
   * If this is not provided, UI will not show Edit button.
   * If operating in single record mode, id will be left out
   */
  public update: ((ctx: CUIContext, id, payload: Partial<T>) => PromiseOrNot<T | string>) &
    ((ctx: CUIContext, payload: Partial<T>) => PromiseOrNot<T | string>) = undefined;

  /**
   * Delete a record. It will be called with a record id.
   * If this is not provided, UI will not show Delete button.
   * Return string or deleted object to show the flash.
   */
  public delete: (ctx: CUIContext, id?) => PromiseOrNot<T | string> = undefined;

  constructor(source?: Partial<CUIActions<T>>) {
    safeAssign(this, source);
  }

  _validateAndCoerce(mode: ICUIMode) {
    const asserters = makeObjectAsserters(this, '"', '" action');

    if (mode === 'single_record') {
      // Single is required in single record mode
      asserters.provided('getSingle');
    } else {
      // List must be supported in normal mode
      asserters.provided('getList');

      if (this.update) {
        // Update requires getSingle
        asserters.provided('getSingle');
      }
    }

    asserters.type('getList', 'function');
    asserters.type('getSingle', 'function');
  }
}
