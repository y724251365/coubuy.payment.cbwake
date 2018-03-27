import {Injectable} from '@angular/core';

@Injectable()
export class CookiesService {

  public t: string;
  public n: string;

  constructor() {
  }

  /**
   * 设置 cookie
   * @param {string} name
   * @param {string} vaule
   * @param {number} time
   */
  setCookie(name: string, vaule: string, time: number) {
    const d = new Date();
    d.setTime(d.getTime() + (time * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + vaule + '; ' + expires;
  }

  /**
   * 获取cookie
   * @param {string} name
   * @returns {string}
   */
  getCookie(name: string) {
    const n = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      const c = ca[i].trim();
      if (c.indexOf(n) === 0) {
        return c.substring(n.length, c.length);
      }
    }
    return '';
  }

  delCookie(name: string) {
    document.cookie = `${name}=; expires=2017-12-18T00:00:00.000Z";`;
  }
}
