import {Inject, Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {CookiesService} from './cookies.service';
import {environment} from '../../environments/environment';


@Injectable()
export class InitService {
  private headers = new Headers({
    'Content-Type': 'application/json; charset=UTF-8',
    'x-access-token': this._cookie.getCookie('t'),
  });
  uri = environment.production ? 'http://oauth.counect.com/' : '/';

  constructor(private http: Http,
              private _cookie: CookiesService) {
  }

  getInit(): Promise<any> {
    const uri = `${this.uri}api/init?num=`+Math.random();
    return this.http
      .get(uri, {headers: this.headers})
      .toPromise();
  }

  getCard(): Promise<any> {
    const uri = `${this.uri}api/card/info`;
    return this.http
      .get(uri, {headers: this.headers})
      .toPromise();
  }
  // 2018年03月26日更新接口信息。
  getAddress(mcode): Promise<any> {
    const body = {
      'data': {
        'mcode': mcode,
      },
    };
    const uri = `${this.uri}api/mkfpage/address`;
    return this.http
    .post(uri, JSON.stringify(body), {headers: this.headers})
    .toPromise();
  }

  getAddr(appid): Promise<any> {
    const body = {
      'data': {
        'appid': appid,
      },
      'sign': '1234'
    };
    const uri = `${this.uri}api/kfpage/addr`;
    return this.http
      .post(uri, JSON.stringify(body), {headers: this.headers})
      .toPromise();
  }

  getHotel(appid): Promise<any> {
    const body = {
      'data': {
        'appid': appid,
      },
      'sign': '1234'
    };
    const uri = `${this.uri}api/kfpage/sellers`;
    return this.http
      .post(uri, JSON.stringify(body), {headers: this.headers})
      .toPromise();
  }

  getGoods(appid): Promise<any> {
    const body = {
      'data': {
        'appid': appid,
      },
      'sign': '1234'
    };
    const uri = `${this.uri}api/kfpage/goods`;
    return this.http
      .post(uri, JSON.stringify(body), {headers: this.headers})
      .toPromise();
  }

}
