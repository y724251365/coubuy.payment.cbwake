import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {RouteRoutingModule} from './routes-routing.module';
import {CoubuyComponent} from './coubuy/coubuy.component';
import {ErrorComponent} from './error/error.component';
import {SuccessComponent} from './success/success.component';

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: [CoubuyComponent, ErrorComponent, SuccessComponent]
})

export class RoutesModule {
}
