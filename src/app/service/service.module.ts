import {NgModule} from '@angular/core';
import {CookiesService} from './cookies.service';
import {AuthGuardService} from './auth-guard.service';
import {InitService} from './init.service';

export {
  CookiesService,
  AuthGuardService,
  InitService
};

@NgModule()
export class ServicesModule {
  static forRoot() {
    return {
      ngModule: ServicesModule,
      providers: [
        CookiesService,
        AuthGuardService,
        InitService
      ]
    };
  }
}
