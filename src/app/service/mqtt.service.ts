import {Injectable, Input} from '@angular/core';
import {environment} from '../../environments/environment';
import {Paho} from 'ng2-mqtt/mqttws31';

@Injectable()
export class MqttService {
  private prod = environment.production;
  private _mqtt_host = environment.mqtt_host;
  private _client: Paho.MQTT.Client;
  public mqttCommand = {
    devAlive: (cardno, sn) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'dev_alive',
        'data': {
          'sn': sn,
          'cardno': cardno
        }
      }),
    flash: (cardno, sn) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'flash',
        'data': {
          'sn': sn,
          'cardno': cardno
        }
      }),
    getOrder: (cardno, sn, goods) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'get_order',
        'data': {
          'sn': sn,
          'cardno': cardno,
          'goods': goods
        }
      }),
    pay: (cardno, sn, tn) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'get_order',
        'data': {
          'sn': sn,
          'cardno': cardno,
          'tn': tn
        }
      }),
    delay: (cardno, sn) => JSON.stringify(
      {
        'clientid': cardno,
        'action': 'delay',
        'data': {
          'sn': sn,
          'cardno': cardno
        }
      }),
  };

  public connect(hostname, port, _clientId, _user, _pass) {
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
        // this.flash(user, this.pageinfo.sn);
        // this.devAlive(user, this.pageinfo.sn);
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
    this._client.onConnectionLost = (responseObject) => {
      if ((responseObject as any).errorCode !== 0) {
        console.log('页面掉线');
      }
    }
    ;
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
        case 'dev_alive_return':
          this.aliveReturn(messagej);
          break;
        case 'flash_return':
          this.flashReturn(messagej);
          break;
        case 'return_get_order':
          this.returnGetOrder(messagej);
          break;
        case 'return_pay':
          // returnPay(messagej);
          break;
        case 'return_coin':
          // returnCoin(messagej);
          break;
        case 'charge':
          // charge(messagej);
          break;
        case 'return_delay':
          // returnDelay(messagej);
          break;
        case 'return_js_payment':
          // returnJsPayment(messagej);
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
  // 重新查询设备状态
  devAliveSetTimeout(time) {
    window.setTimeout(() => {
      // this.devAlive(String(this.pageinfo.cardno), String(this.pageinfo.sn));
    }, time);
  }

  // 询问设备状态
  devAlive(cardno, sn) {
    this.publish('dev_alive', 2, this.mqttCommand.devAlive(cardno, sn), false);
  }

  // 获取卡的余额信息
  flash(cardno, sn) {
    this.publish('flash', 2, this.mqttCommand.flash(cardno, sn), false);
  }

  // 获取预购单
  getOrder(cardno, sn, goods) {
    this.publish('get_order', 2, this.mqttCommand.getOrder(cardno, sn, goods), false);
  }

// 支付
  pay(cardno, sn, tn) {
    this.publish('pay', 2, this.mqttCommand.pay(cardno, sn, tn), false);
  }

// 询问剩余时长
  pubDelay(cardno, sn) {
    this.publish('delay', 2, this.mqttCommand.delay(cardno, sn), false);
  }

  // SERVE--->RPAGE ---------------------------------------------------------START
  // 返回错误
  retrunErr(messagej) {
    console.log('retrunErr');
    console.log(messagej);
    // TODO 移除锁、隐藏loading、弹出错误提示
  }

  // 响应设备状态
  aliveReturn(messagej) {
    console.log('aliveReturn');
    console.log(messagej);
    const machAlive = messagej.data.alive_status; // 机器是否存活
    const insetCoin = messagej.data.inset_coin; // 机器是否可投币
    const goods_alive = messagej.data.goods_alive; // 货道状态
    if (machAlive === 0) {
      if (insetCoin === 0) {
        // TODO 设备正常售卖dev_online();
        // this.status = '';
        // this.status_dot = false;
      } else {
        this.devAliveSetTimeout(4000);
        // this.status = environment.config.errObj.willonline;
        // this.status_dot = true;
      }
    } else {
      // this.devAliveSetTimeout(4000);
      // this.status = environment.config.errObj.willonline;
      // this.status_dot = true;
    }
  }

  // 返回卡的信息
  flashReturn(messagej) {
    console.log('flashReturn');
    console.log(messagej);
    // this.pageinfo.amount = messagej.data.card_info.namount;
    // this.pageinfo.red_packet = messagej.data.card_info.red_packet;
  }

  // 返回预购单的支付信息，支付金额，购买商品，优惠信息，等待确认支付
  returnGetOrder(messagej) {
    console.log('returnGetOrder');
    console.log(messagej);
    // this.toastService.show(JSON.stringify(messagej.data.pay_info));
  }
}
