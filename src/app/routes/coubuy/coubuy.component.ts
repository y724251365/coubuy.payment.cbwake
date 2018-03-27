import {Component, OnInit, ViewChild} from '@angular/core';
import {InitService} from '../../service/init.service';
import {Paho} from 'ng2-mqtt/mqttws31';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

declare var wx: any;
declare var WeixinJSBridge: any;

@Component({
  selector: 'app-coubuy',
  templateUrl: './coubuy.component.html',
  styleUrls: ['./coubuy.component.scss']
})
export class CoubuyComponent implements OnInit {
  goods = [];
  loading = false;
  success = false;
  machine = {
    mcode: '',
    appid: '',
    client: '',
    aux: '',
    sn: '',
  };
  card = {
    cardno: '',
    mqttpswd: '',
    namount: 0,
    red_packet: 0,
  };
  room = {
    address_code: 0,
    address_name: '',
    address_phone: '',
    description: '',
    logo: '',
    mobile: '',
    storename: '',
    storeaddr: '',
    update_time: ''
  };
  hotel = {
    name: '',
    logo: '',
    title: '',
  };
  formsVali: any = { wakeways: '', waketime: '', phone: '', more: ''}; // 获取下单信息
  validateForm: FormGroup;
  toBack: any;

  // mqtt
  public _mqtt_host = environment.mqtt_host;
  public _client: Paho.MQTT.Client;
  public mqttCommand = {
    flash: (cardno, sn) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'flash',
        'data': {
          'sn': sn,
          'cardno': cardno
        }
      }),
    getOrder: (cardno, mcode, goods, kfAppid, appid) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'KF_getPrice',
        'data': {
          'mcode': mcode,
          'cardno': cardno,
          'goods': goods,
          'kf_appid': kfAppid,
          'appid': appid
        }
      }),
    pay: (cardno, mcode, tn, address, room, tel, remarks) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'KF_pay',
        'data': {
          'mcode': mcode,
          'cardno': cardno,
          'tn': tn,
          'address': address,
          'room': room,
          'tel': tel,
          'remarks': remarks
        }
      }),
  };

  connect(hostname, port, _clientId, _user, _pass) {
    const clientId = '' + _clientId;
    const user = '' + _user;
    const pass = '' + _pass;
    this._client = new Paho.MQTT.Client(hostname, Number(port), clientId);
    console.log(this._client);
    const options = {
      timeout: 60,
      userName: user,
      password: pass,
      invocationContext: {
        host: hostname,
        port: port,
        clientId: clientId
      },
      keepAliveInterval: 30,
      cleanSession: true,
      onSuccess: () => {
        console.log('connect success');
        this._client.subscribe(user, {qos: 0});
        this.flash(user, this.machine.sn);
      },
      onFailure: (context) => {
        console.log(`Failed to connect` + context.errorMessage);
      }
    };
    // lastWillMessage 发送消息
    const lastWillMessage = new Paho.MQTT.Message(`{'clientid':${clientId},'cardno':${user},'data':{'name':'willonline','rcode':'0'}}`);
    lastWillMessage.destinationName = 'mobwill';
    lastWillMessage.qos = 0;
    lastWillMessage.retained = false;
    (options as any).willMessage = lastWillMessage;
    console.log(options);
    this._client.onConnectionLost = (responseObject) => {
      if ((responseObject as any).errorCode !== 0) {
        console.log(responseObject);
        console.log('页面掉线');
        this._router.navigate([`/error`], {queryParams: {rcode: '页面掉线了'}});
      }
    };
    this._client.onMessageArrived = (message) => {
      let messagej;
      try {
        // messagej = eval('(' + message.payloadString + ')');
        messagej = JSON.parse(message.payloadString);
      } catch (err) {
        return console.log(err);
      }
      switch (messagej.action) {
        case 'return_err':
          this.retrunErr(messagej);
          break;
        case 'flash_return':
          this.flashReturn(messagej);
          break;
        case 'return_KF_getPrice':
          this.returnGetOrder(messagej);
          break;
        case 'return_pay':
          this.returnPay(messagej);
          break;
        case 'return_coin':
          this.returnCoin(messagej);
          break;
        case 'charge':
          this.charge(messagej);
          break;
        case 'return_js_payment':
          this.returnJsPayment(messagej);
          break;
      }
    };
    this._client.connect(options);
  }

  publish(topic, qos, messagej, retain) {
    const message = new Paho.MQTT.Message(messagej);
    message.destinationName = topic;
    message.qos = Number(qos);
    message.retained = retain;
    console.log(messagej);
    try {
      this._client.send(message);
    } catch (err) {
      console.log(err);
      console.log(this._client);
    }
  }

  // PAGE ---> SERVER =========================================================START

  // 获取卡的余额信息
  flash(cardno, sn) {
    this.publish('flash', 2, this.mqttCommand.flash(cardno, sn), false);
  }

  // 获取预购单
  getOrder(cardno, mcode, goods, kfAppid, appid) {
    this.publish('KF_getPrice', 2, this.mqttCommand.getOrder(cardno, mcode, goods, kfAppid, appid), false);
  }

  // 支付
  pay(cardno, mcode, tn, address, room, tel, remarks) {
    this.publish('KF_pay', 2, this.mqttCommand.pay(cardno, mcode, tn, address, room, tel, remarks), false);
  }

  // SERVE--->RPAGE ---------------------------------------------------------START
  // 返回错误
  retrunErr(messagej) {
    console.log('retrunErr');
    console.log(messagej);
    // TODO 移除锁、隐藏loading、弹出错误提示
  }

  // 返回卡的信息
  flashReturn(messagej) {
    console.log('flashReturn');
    console.log(messagej);
    this.card.namount = messagej.data.card_info.namount;
    this.card.red_packet = messagej.data.card_info.red_packet;
  }

  // 返回预购单的支付信息，支付金额，购买商品，优惠信息，等待确认支付
  returnGetOrder(messagej) {
    console.log('returnGetOrder');
    console.log(messagej);
    const orderId = messagej.data.tn; // 存储支付单号
    const address = messagej.data.address;
    const room = messagej.data.room;
    const tel = messagej.data.tel;
    console.log(`=======支付信息=======`);
    console.log(this.validateForm.value);
    const tmp = this.validateForm.value;
    const remarks = `叫醒方式:${tmp.wakeways},叫醒时间:${tmp.waketime},个人号码:${tmp.phone},其他备注:${tmp.more}`;
    console.log(remarks);
    this.pay(this.card.cardno, this.machine.mcode, orderId, address, room, tel, remarks);
  }

  // 支付成功
  returnPay(messagej) {
    console.log('returnPay');
    console.log(messagej.action);
    console.log(messagej);
    this.flash(this.card.cardno, this.machine.sn);
  }

  // 正在出货
  returnCoin(messagej) {
    console.log('returnCoin');
    console.log(messagej.action);
    console.log(messagej);
    this.flash(this.card.cardno, this.machine.sn);
  }

  // 找零并出货
  charge(messagej) {
    console.log('charge');
    console.log(messagej.action);
    console.log(messagej);
    if (messagej.rcode === 0) {
      this.flash(this.card.cardno, this.machine.sn);
    } else {
      console.log(messagej);
      // alert(JSON.stringify(messagej));
    }
  }

  // js支付
  returnJsPayment(messagej) {
    console.log('returnJsPayment');
    console.log(messagej.action);
    console.log(messagej);
    this.goPay(messagej.data.pre_payment, this.machine.client);
  }

  // 微信支付宝支付成功标识 -- 废除 --> 支付成功标识改为 pay_return
  goPay(payargs, client) {

    switch (client) {
      case 'weixin':
        console.log('下单成功');
        this._router.navigate(['success']);
        break;
      default:
        break;
    }
  }

  constructor(private _init: InitService,
              private _router: Router,
              private fb: FormBuilder) {
  }

  selectGoods() {
    const goods = [];
    this.goods.forEach((i) => {
      i.goods.forEach((good) => {
        if (good.count) {
          goods.push(good);
        }
      });
    });
    return goods;
  }

  // 单商品购买
  topay(good) {
    // TODO 验证表单
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[ i ].markAsDirty();
    // }
    const tmp = [{
      goods_id: good.goods_id,
      count: 1,
      id: good.id,
      type: 'kf',
    }];
    this.getOrder(this.card.cardno, this.machine.mcode, tmp, this.machine.aux, this.machine.appid);
  }

  ngOnInit() {
    if (this.toBack == null) {
      localStorage.setItem('back','1');
      this.toBack = localStorage.getItem('back');
    }
    this._init.getInit().then(res => {
      this.machine = res.json().result;
      console.log(this.machine);

      // 获取卡信息
      this._init.getCard().then(res2 => {
        this.card = res2.json().result;
        console.log(this.card);
        if (this.toBack != 1) {
          console.log(this.toBack);
          this.connect(this._mqtt_host, '8083', this.card.cardno, this.card.cardno, this.machine.sn);
        }
      });
      // 获取商家信息
      this._init.getAddress(this.machine.aux).then(res4 => {
        this.room = res4.json().result;
        console.log(this.room);
        this.loading = true;
      })
      // 获取商品信息
      this._init.getGoods(this.machine.appid).then(res3 => {
        this.goods = res3.json().result;
        console.log(res3.json().result);
      });

    });
    /* this.validateForm = this.fb.group(
      {
        waketime: [null, [Validators.required]],
        wakeways: [null, [Validators.required]],
        phone: [null],
        more: [null],
      },
    ); */
    this.validateForm = new FormGroup({
      'wakeways': new FormControl(this.formsVali.wakeways, [Validators.required]),
      'waketime': new FormControl(this.formsVali.waketime, [Validators.required]),
      'phone': new FormControl(this.formsVali.phone, []),
      'more': new FormControl(this.formsVali.more, []),
    });
  }
  toSuccess() {
    this._router.navigate(['/success',
            {wakeways: this.formsVali.wakeways,
              waketime: this.formsVali.waketime,
              phone: this.formsVali.phone,
              more: this.formsVali.more}]);
    console.log(this.formsVali);
  }
  get wakeways() { return this.validateForm.get('wakeways'); }

  get waketime() { return this.validateForm.get('waketime'); }
  }
