import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import * as _ from 'lodash';
import { PracticeData } from 'app/shared/models/practice-data.model';
import { PracticesService } from 'app/shared/services/practices/practices.service';
import { Page } from 'app/shared/models/page.model';
import { Sort } from 'app/shared/models/sort.model';
import { PagedData } from 'app/shared/models/paged-data.model';

@Component({
  selector: 'intel-practices',
  templateUrl: './practices.component.html',
  styleUrls: ['./practices.component.scss'],
})

export class PracticesComponent implements OnInit {

  public rows: Array<PracticeData>;
  public page = new Page();
  public searchField = new FormControl();
  public lastUpdate: number;
  private sort = new Sort();
  public iconsCss = {
    sortAscending: 'ci-arrow-down',
    sortDescending: 'ci-arrow-up',
    pagerLeftArrow: 'ci-arrow-left',
    pagerRightArrow: 'ci-arrow-right',
    pagerPrevious: 'ci-triangle-left',
    pagerNext: 'ci-triangle-right'
  };


  constructor(private practiceService: PracticesService) { }

  ngOnInit() {
    this.page.pageNumber = 0;
    this.page.size = 20;

    this.getPage({ offset: 0 });

    this.searchField.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(name => {
        this.page.pageNumber = 0;
        this.page.filter = name;
        this.practiceService.fetch(this.page)
          .subscribe((data) => {
            this.updateData(data);
          });
      });
  }

  /**
   * Fetch from server side chunk with sorted data and update table data.
   * @param  {Object} event Event of click on column title.
   */
  public onSort(event) {
    this.sort = event.sorts[0];
    _.assignIn(this.page, { sort: this.sort });
    this.practiceService.sort(this.page)
      .subscribe((data) => {
        this.updateData(data);
      });
  }

  /**
   * Get new page with data for table.
   * @param  {Object} pageInfo Ofset info.
   */
  public getPage(pageInfo) {
    this.page.pageNumber = pageInfo.offset;
    _.assignIn(this.page, { sort: this.sort });
    this.practiceService.fetch(this.page)
      .subscribe((data) => {
        this.updateData(data);
      });
  }

  /**
   * For updating data in view.
   * @param {Object} data Contains page information, data for table and last update date.
   */
  private updateData(data: PagedData): void {
    this.page = data.page;
    this.rows = data.rows;
    this.lastUpdate = data.lastUpdate;
  }
}
