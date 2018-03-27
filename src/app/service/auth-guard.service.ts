import {Injectable} from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {CookiesService} from './cookies.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router,
              private _cookie: CookiesService) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    console.log(url);
    if (url === '/coubuy') {
      if (this._cookie.getCookie(`n`)) {
        return true;
      } else {
        this.router.navigate(['error']);
        return false;
      }
    } else if (url === '/success') {
      this.router.navigate(['success']);
      return false;
    }else {
      this.router.navigate(['error']);
      return false;
    }
  }


}
