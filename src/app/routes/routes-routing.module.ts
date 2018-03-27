import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {environment} from '../../environments/environment';
import {AuthGuardService} from '../service/auth-guard.service';

import {CoubuyComponent} from './coubuy/coubuy.component';
import {SuccessComponent} from './success/success.component';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  {path: '', redirectTo: 'coubuy', pathMatch: 'full'},
  {path: 'coubuy', component: CoubuyComponent, canActivate: [AuthGuardService]},
  {path: 'error', component: ErrorComponent},
  {path: 'success', component: SuccessComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: environment.useHash})],
  exports: [RouterModule]
})
export class RouteRoutingModule {
}
