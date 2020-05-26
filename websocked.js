import {Observable, Subject} from 'rxjs';

export class $WebSocket {

  static Helpers = class {
    static isPresent(obj) {
      return obj !== undefined && obj !== null;
    }

    static isString(obj) {
      return typeof obj === 'string';
    }

    static isArray(obj) {
      return Array.isArray(obj);
    }

    static isFunction(obj) {
      return typeof obj === 'function';
    }
  };

  reconnectAttempts = 0;
  sendQueue = [];
  onOpenCallbacks = [];
  onMessageCallbacks = [];
  onErrorCallbacks = [];
  onCloseCallbacks = [];
  readyStateConstants = {
    'UNINITIALIZED': -1,
    'CONNECTING': 0,
    'OPEN': 1,
    'CLOSING': 2,
    'CLOSED': 3,
    'RECONNECT_ABORTED': 4
  };
  normalCloseCode = 1000;
  reconnectableStatusCodes = [4000];
  socket;
  dataStream;
  errorMessages;
  internalConnectionState;

  url;
  protocols;
  config;
  binaryType;

  constructor(url, protocols, config, binaryType) {
    this.url = url;
    let match = new RegExp('wss?:\/\/').test(url);
    if (!match) {
      throw new Error('Invalid url provided');
    }
    this.config = Object.assign({initialTimeout: 500, maxTimeout: 300000, reconnectIfNotNormalClose: false}, config);
    this.binaryType = binaryType || 'blob';
    this.dataStream = new Subject();
    this.errorMessages = new Subject();
    this.connect(true);
  }

  connect(force = false) {
    // console.log("WebSocket connecting...");
    let self = this;
    if (force || !this.socket || this.socket.readyState !== this.readyStateConstants.OPEN) {
      self.socket = this.protocols ? new WebSocket(this.url, this.protocols) : new WebSocket(this.url);
      self.socket.binaryType = self.binaryType;

      self.socket.onopen = (ev) => {
        // console.log('onOpen: ', ev);
        this.send4Direct("heartBeats",true);
        this.onOpenHandler(ev);
      };
      self.socket.onmessage = (ev) => {
        // console.log('onNext: ', ev.data);
        self.onMessageHandler(ev);
        this.dataStream.next(ev);
        if(ev.data.indexOf("heartBeats")!= -1){
          setTimeout(() => {
            this.send4Direct("heartBeats",true);
          }, 5000)
        }
      };
      this.socket.onclose = (ev) => {
        // console.log('onClose ', ev);
        self.onCloseHandler(ev);
      };

      this.socket.onerror = (ev) => {
        // console.log('onError ', ev);
        self.onErrorHandler(ev);
        this.errorMessages.next(ev);
      };

    }
  }

  getErrorStream() {
    return this.errorMessages;
  }

  /**
   * Run in Block Mode
   * Return true when can send and false in socket closed
   * @param data
   * @returns {boolean}
   */
  send4Direct(data, binary) {
    let self = this;
    if (this.getReadyState() !== this.readyStateConstants.OPEN
      && this.getReadyState() !== this.readyStateConstants.CONNECTING) {
      this.connect();
    }
    self.sendQueue.push({message: data, binary: binary});
    if (self.socket.readyState === self.readyStateConstants.OPEN) {
      self.fireQueue();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Return Promise
   * When can Send will resolve Promise
   * When Socket closed will reject Promise
   * @param data
   * @returns {Promise<any>}
   */
  send4Promise(data, binary) {
    return new Promise(
      (resolve, reject) => {
        if (this.send4Direct(data, binary)) {
          return resolve();
        } else {
          return reject(Error('Socket connection has been closed'));
        }
      }
    )
  }

  /**
   * Return cold Observable
   * When can Send will complete observer
   * When Socket closed will error observer
   * @param data
   * @returns {Observable<any>}
   */
  send4Observable(data, binary) {
    return Observable.create((observer) => {
      if (this.send4Direct(data, binary)) {
        return observer.complete();
      } else {
        return observer.error('Socket connection has been closed');
      }
    });
  }

  send4Mode = WebSocketSendMode.Observable;

  /**
   * Set send(data) function return mode
   * @param mode
   */
  setSend4Mode(mode) {
    this.send4Mode = mode;
  }

  /**
   * Use {mode} mode to send {data} data
   * If no specify, Default SendMode is Observable mode
   * @param data
   * @param mode
   * @param binary
   * @returns {any}
   */
  send(data, mode, binary) {
    switch (typeof mode !== 'undefined' ? mode : this.send4Mode) {
      case WebSocketSendMode.Direct:
        return this.send4Direct(data, binary);
      case WebSocketSendMode.Promise:
        return this.send4Promise(data, binary);
      case WebSocketSendMode.Observable:
        return this.send4Observable(data, binary);
      default:
        throw Error('WebSocketSendMode Error.');
    }
  }

  getDataStream() {
    return this.dataStream;
  }

  onOpenHandler(event) {
    this.reconnectAttempts = 0;
    this.notifyOpenCallbacks(event);
    this.fireQueue();
  }

  notifyOpenCallbacks(event) {
    for (let i = 0; i < this.onOpenCallbacks.length; i++) {
      this.onOpenCallbacks[i].call(this, event);
    }
  }

  fireQueue() {
    // console.log("fireQueue()");
    while (this.sendQueue.length && this.socket.readyState === this.readyStateConstants.OPEN) {
      let data = this.sendQueue.shift();

      console.log("fireQueue: ", data);
      if (data.binary) {
        this.socket.send(data.message);
      } else {
        this.socket.send(
          $WebSocket.Helpers.isString(data.message) ? data.message : JSON.stringify(data.message)
        );
      }
      // data.deferred.resolve();
    }
  }

  notifyCloseCallbacks(event) {
    for (let i = 0; i < this.onCloseCallbacks.length; i++) {
      this.onCloseCallbacks[i].call(this, event);
    }
  }

  notifyErrorCallbacks(event) {
    for (let i = 0; i < this.onErrorCallbacks.length; i++) {
      this.onErrorCallbacks[i].call(this, event);
    }
  }

  onOpen(cb) {
    this.onOpenCallbacks.push(cb);
    return this;
  };

  onClose(cb) {
    this.onCloseCallbacks.push(cb);
    return this;
  }

  onError(cb) {
    this.onErrorCallbacks.push(cb);
    return this;
  };

  onMessage(callback, options) {
    if (!$WebSocket.Helpers.isFunction(callback)) {
      throw new Error('Callback must be a function');
    }

    this.onMessageCallbacks.push({
      fn: callback,
      pattern: options ? options.filter : undefined,
      autoApply: options ? options.autoApply : true
    });
    return this;
  }

  onMessageHandler(message) {
    let self = this;
    let currentCallback;
    for (let i = 0; i < self.onMessageCallbacks.length; i++) {
      currentCallback = self.onMessageCallbacks[i];
      currentCallback.fn.apply(self, [message]);
    }
  };

  onCloseHandler(event) {
    this.notifyCloseCallbacks(event);
    if ((this.config.reconnectIfNotNormalClose && event.code !== this.normalCloseCode)
      || this.reconnectableStatusCodes.indexOf(event.code) > -1) {
      this.reconnect();
    } else {
      this.sendQueue = [];
      this.dataStream.complete();
    }
  };

  onErrorHandler(event) {
    this.notifyErrorCallbacks(event);
  };

  reconnect() {
    this.close(true, true);
    let backoffDelay = this.getBackoffDelay(++this.reconnectAttempts);
    // let backoffDelaySeconds = backoffDelay / 1000;
    // console.log('Reconnecting in ' + backoffDelaySeconds + ' seconds');
    setTimeout(() => {
      if (this.config.reconnectIfNotNormalClose) {
        this.connect()
      }
    }, backoffDelay);
    return this;
  }

  close(force = false, keepReconnectIfNotNormalClose) {
    if (!keepReconnectIfNotNormalClose) {
      this.config.reconnectIfNotNormalClose = false;
    }

    if (force || !this.socket.bufferedAmount) {
      this.socket.close(this.normalCloseCode);
    }
    return this;
  };

  // Exponential Backoff Formula by Prof. Douglas Thain
  // http://dthain.blogspot.co.uk/2009/02/exponential-backoff-in-distributed.html
  getBackoffDelay(attempt) {
    let R = Math.random() + 1;
    let T = this.config.initialTimeout;
    let F = 2;
    let N = attempt;
    let M = this.config.maxTimeout;

    return Math.floor(Math.min(R * T * Math.pow(F, N), M));
  };

  setInternalState(state) {
    if (Math.floor(state) !== state || state < 0 || state > 4) {
      throw new Error('state must be an integer between 0 and 4, got: ' + state);
    }

    this.internalConnectionState = state;

  }

  getReadyState() {
    if (this.socket == null) {
      return this.readyStateConstants.UNINITIALIZED;
    }
    return this.internalConnectionState || this.socket.readyState;
  }
}

var WebSocketSendMode = {
  Direct: 1,
  Promise: 2,
  Observable: 3,
};

// export enum WebSocketSendMode {
//     Direct, Promise, Observable
// }

// export type BinaryType = "blob" | "arraybuffer";

//--------------------------------------------------------------------------------------------------------
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Location, PlatformLocation, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService, MenuService } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { $WebSocket } from '@service/websocket';
import { AlarmService } from '@service/alarm';
import { ACLService } from '@delon/acl';
import { ModuleDisCharge, ModuleAlarm, getTenant } from '@shared/utils';

@Component({
  selector: 'header-alarm',
  template: `
    <div *ngIf="acls.FAULT || acls.ALARM || acls.DISCHARGE_ABNORMAL || acls.OBD_ABNORMAL || acls.TERMINAL_REMOVE" 
    class="alain-default__nav-item d-flex align-items-center px-sm"
    nz-dropdown
    nzPlacement="bottomRight"
    [nzDropdownMenu]="menuTpl1"
    >
      <i nz-icon [iconfont]="'icontixing'"></i>
      <nz-badge [nzCount]="data.total">
      <a class="head-example"></a>
    </nz-badge>
    </div>
    <nz-dropdown-menu #menuTpl1="nzDropdownMenu">
    <div nz-menu class="width-sm alarm-list">
      <a *ngIf="acls.FAULT && data.FAULT && data.FAULT > 0" nz-menu-item (click)="navTo('/alarm/faults')">
        <div>{{ "车辆故障" | translate }}</div><div class="num">{{data.FAULT | number:'3.0-0'}}</div>
      </a>
      <a *ngIf="acls.ALARM && data.ALARM && data.ALARM > 0" nz-menu-item  (click)="navTo('/alarm/history')">
        <div>{{ "车辆报警" | translate }}</div><div class="num">{{data.ALARM | number:'3.0-0'}}</div>
      </a>
      <a *ngIf="acls.DISCHARGE_ABNORMAL && data.DISCHARGE_ABNORMAL && data.DISCHARGE_ABNORMAL > 0" nz-menu-item (click)="navTo('/discharge/exception')">
        <div>{{ "排放异常" | translate }}</div><div class="num">{{data.DISCHARGE_ABNORMAL | number:'3.0-0'}}</div>
      </a>
      <a *ngIf="acls.OBD_ABNORMAL && data.OBD_ABNORMAL && data.OBD_ABNORMAL > 0" nz-menu-item (click)="navTo('/discharge/obd')">
        <div>{{ "OBD异常" | translate }}</div><div class="num">{{data.OBD_ABNORMAL | number:'3.0-0'}}</div>
      </a>
      <a *ngIf="acls.TERMINAL_REMOVE && data.TERMINAL_REMOVE && data.TERMINAL_REMOVE > 0" nz-menu-item (click)="navTo('/alarm/terminal')">
        <div>{{ "拆除报警" | translate }}</div><div class="num">{{data.TERMINAL_REMOVE | number:'3.0-0'}}</div>
      </a>
    </div>
  </nz-dropdown-menu>
  `,
  styles: [`
  .alarm-list .ant-dropdown-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }
  .num {
    color:red
  }
  .ant-badge {
    position: absolute;
    right: 0;
    top: 5px;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmComponent implements OnInit, OnDestroy {

  data = { total: 0, "FAULT": 0, "ALARM": 0, "DISCHARGE_ABNORMAL": 0, "OBD_ABNORMAL": 1, "TERMINAL_REMOVE": 0 }

  acls = {
    ALARM: true,
    FAULT: true,
    DISCHARGE_ABNORMAL: true,
    OBD_ABNORMAL: true,
    TERMINAL_REMOVE: true,
  }
  private _websocket: $WebSocket;
  private wsit;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: PlatformLocation,
    private menuSrv: MenuService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private _acl: ACLService,
    private _alarms: AlarmService,
  ) {

  }

  ngOnInit() {
    this.acls = {
      ALARM: this._acl.canAbility(ModuleAlarm.vehicleAlarm.id),
      FAULT: this._acl.canAbility(ModuleAlarm.vehicleFault.id),
      DISCHARGE_ABNORMAL: this._acl.canAbility(ModuleDisCharge.exception.id),
      OBD_ABNORMAL: this._acl.canAbility(ModuleDisCharge.obd.id),
      TERMINAL_REMOVE: this._acl.canAbility(ModuleAlarm.terminalAlarm.id),
    }
    //如果没有权限，不需要websocket
    if (!(this.acls.ALARM || this.acls.FAULT || this.acls.DISCHARGE_ABNORMAL || this.acls.OBD_ABNORMAL || this.acls.TERMINAL_REMOVE)) {
      return;
    }
    this._alarms.userAlarms().subscribe(data => {
      let total = 0;
      for (let prop in data) {
        if (this.acls[prop]) {
          total += + data[prop];
        }
      }
      data.total = total;
      this.data = data;
      this.cdr.detectChanges();
    })
    let token = this.tokenService.get().token;
    // let uid = this.settings.user.id;
    let host = this.location.hostname;
    let port = this.location.port;
    for (const i in this.location) {
      if (i === 'location') {
        const localLocation = this.location[i];
        // url = localLocation.origin;
        host = localLocation.hostname;
        port = localLocation.port;
        break;
      }
    }
    let protocol = this.location.protocol;
    let url = `ws://${host}:${port}/websocket/alarms/auth/${token}`;
    if(protocol && protocol.indexOf("https") != -1) {
      url = `wss://${host}:${port}/websocket/alarms/auth/${token}`;
    }

    this._websocket = new $WebSocket(url, null, { reconnectIfNotNormalClose: true });

    this.echo();
    // this._websocket.send("start!").subscribe((msg: MessageEvent) => {
    // console.log(msg.data);
    // this.data = msg.data;
    // })
    this._websocket.getDataStream().subscribe((msg: MessageEvent) => {
      if(msg.data.indexOf("echo :") != -1) {
        return;
      }
      const d = JSON.parse(msg.data);
      if (this.data[d.alarmType]) {
        this.data[d.alarmType] = + this.data[d.alarmType] + +d.amount
      } else {
        this.data[d.alarmType] = +d.amount
      }
      if (this.data[d.alarmType] < 0) {
        this.data[d.alarmType] = 0;
      }
      if (this.acls[d.alarmType]) {
        this.data.total = +this.data.total + +d.amount;
        if (this.data.total < 0) {
          this.data.total = 0;
        }
        // console.log(this.data);
        this.cdr.detectChanges();
      }
    })
  }

  private echo() {
    if(this._websocket) {
      this.wsit = setInterval(() => {
        this._websocket.send("hello!").subscribe((msg: MessageEvent) => {
          console.log(msg.data);
        })
      }, 10 * 1000)
    }
  }

  navTo(url) {
    const tenant = getTenant(this.route);
    this.menuSrv.openedByUrl(url);
    this.router.navigate([tenant + url]);
  }


  ngOnDestroy() {
    if (this._websocket) {
      try {
        this._websocket.close(false);
      } catch (e) { }
    }
  }


}

//-----------------------------------------------------------------------------------------------------------------
//用法
import {$WebSocket} from '@/api/websocket.js';
      var websocket = new $WebSocket(url, null, { reconnectIfNotNormalClose: true });
 websocket.getDataStream().subscribe((mes)=>{
  console.log(mes);
})
