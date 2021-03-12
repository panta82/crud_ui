import { Request } from 'express';
import { CUIValidationError } from './errors';
import { NextFunction, Response } from 'express-serve-static-core';
import { ICUIRouteName } from './routes';

export interface ICUIMessageFlash {
  message: string;
  flavor: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark';
}
export interface ICUIErrorFlash {
  error: CUIValidationError;
}
export type ICUIFlash = ICUIMessageFlash | ICUIErrorFlash | {};

interface ICUIRequestExtension {
  routeName?: ICUIRouteName;
  csrfToken?: string;
  flash?: ICUIFlash;
}
export type ICUIExtendedRequest = Request & ICUIRequestExtension;

export interface ICUIRequestHandler<
  ResBody = any,
  Locals extends Record<string, any> = Record<string, any>
> {
  (req: ICUIExtendedRequest, res: Response<ResBody, Locals>, next: NextFunction): void;
}

export type IDebugLogFunction = (message: string) => void;

export type PromiseOrNot<T> = Promise<T> | T;

export type PartialExcept<TTarget, TExcept extends keyof TTarget> = Partial<
  Omit<TTarget, TExcept>
> &
  Pick<TTarget, TExcept>;

export type Replace<TTarget extends { [key in keyof TReplacements]: any }, TReplacements> = Omit<
  TTarget,
  keyof TReplacements
> &
  TReplacements;
