import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  rcode: string;
  msg: string;

  constructor() { }

  ngOnInit() {
    this.rcode = this.GetQueryString(`rcode`);
    this.msg = this.GetQueryString(`msg`);
  }

  /**
   * 获取URL参数
   * @param name
   * @returns {any}
   * @constructor
   */

  GetQueryString(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    } else {
      return null;
    }
  }
}
