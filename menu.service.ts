import { Routes, PRIMARY_OUTLET } from '@angular/router';
import { Injectable } from '@angular/core';

import { MenuItem } from './menu-item';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class MenuService {

  private items: Array<MenuItem>;

  constructor() {
    this.items = [];
  }

  /**
   * Add new item in admin menu.
   * @param  {String} icon      Icon name.
   * @param  {String} title     Title of item, showed in admin menu as link.
   * @param  {String} path      Route in project, used as link in admin menu.
   * @param  {Number} index     Index of sort elements in menu.
   * @return {MenuItem}         MenuItem object represents created element.
   */
  private addLink(icon: string, title: string, path: string, index: number): MenuItem {
    const item = new MenuItem(icon, title, path, index);

    if (!index) {
      this.items.push(item);
    } else {
      this.items.splice(index, 0, item);
    }

    return item;
  }

  /**
   * Check routes and add new elements into admin menu.
   * @param  {Array} routes  Array of routes.
   * @param  {Number} index  Position of element into admin menu.
   * @return {Array}         Array contains added routes.
   */
  public addLinksFromRoutes(routes: Routes, index?: number): Routes {
    // iterate over each route
    for (const route of routes) {
      // verify primary route
      if (route.outlet && route.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      // Veryfy the custom data properties (icon, title) is specified on the
      // route. This fields is required.
      if (route.data && route.data.title && route.data.icon) {
        this.addLink(
          route.data.icon,
          route.data.title,
          route.path,
          index,
        );
      }
    }
    return routes;
  }

  /**
   * Return all items for admin menu.
   * @return {Observable} Observable object represents array of all items for
   * admin menu.
   */
  public getMenuItems(): Observable<Array<MenuItem>> {
    return Observable.of(this.items);
  }
}
