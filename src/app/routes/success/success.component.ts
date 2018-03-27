import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  rcode: string;
  msg: string;
  wakeways: any;
  waketime: any;
  phone: any;
  more: any;

  constructor(private aRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.aRoute.params.subscribe((data: any) => {
      console.log(data);
      this.wakeways = data.wakeways;
      this.waketime = data.waketime;
      this.phone = data.phone;
      this.more = data.more;
    });
  }

}
