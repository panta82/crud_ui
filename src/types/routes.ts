import { safeAssign } from '../tools';

/**
 * Define URL-s to use for various pages
 */
export class CUIRoutes {
  public indexPage = '/';

  public createPage = '/create';
  public createAction = '/create';

  public editPage = (id: string) => '/edit/' + encodeURI(id);
  public editAction = (id: string) => '/edit/' + encodeURI(id);

  public detailPage = (id: string) => '/detail/' + encodeURI(id);
  public detailEditPage = (id: string) => '/detail/' + encodeURI(id) + '/edit';
  public detailEditAction = (id: string) => '/detail/' + encodeURI(id) + '/edit';

  public singleRecordModeEditPage = '/edit';
  public singleRecordModeEditAction = '/edit';

  public deleteAction = (id: string) => '/delete/' + encodeURI(id);

  constructor(source?: Partial<CUIRoutes>) {
    safeAssign(this, source);
  }
}

export const routes = new CUIRoutes();

export type ICUIRouteName = keyof CUIRoutes;
