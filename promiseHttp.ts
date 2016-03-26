import * as http from "http";
import * as events from "events";
import * as rxjs from "rxjs";

import IncomingMessage = http.IncomingMessage;
import ServerResponse = http.ServerResponse;
import Server = http.Server;

import Observable = rxjs.Observable;
import Observer = rxjs.Observer;

interface IEventEmitterProxy {
  on(event: string): Observable<any>;
  once(event: string): Promise<any>;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listenerCount(type: string): number;
}

interface IServerProxy extends IEventEmitterProxy {
  listen(port: number, hostname?: string, backlog?: number): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  listen(path: string): Promise<void>;
  listen(handle: any, listeningListener?: Function): Promise<void>;
  close(): Promise<any>;
  address(): { port: number; family: string; address: string; };
  maxHeadersCount: number;
}

class ServerProxy implements IServerProxy {
  constructor(private server: Server) { }

  listen(...args: Array<any>): Promise<void> {
    return new Promise<void>((resolve) => {
      if (typeof args[args.length - 1] === 'function') {
        throw 'This version of http does not support callback use the returned promise instead';
      }
      this.server.once('listening', resolve);
      this.server.listen.apply(this.server, args);
    });
  }

  close(): Promise<any> {
    return new Promise(resolve => this.server.close(resolve));
  };

  address(): { port: number; family: string; address: string; } {
    return this.server.address();
  };

  get maxHeadersCount(): number {
    return this.server.maxHeadersCount;
  }

  on(event: string): Observable<any> {
    return rxjs.Observable.create((observer: Observer<any>) => {
      const cb = (...args: Array<any>) => observer.next(args)
      this.server.addListener(event, cb);

      return () => {
        this.server.removeListener(event, cb);
      }
    });
  };

  once(event: string): Promise<any> {
    return new Promise(resolve => this.server.once(event, resolve))
  };

  setMaxListeners(n: number): this {
    this.server.setMaxListeners(n);
    return this;
  };

  getMaxListeners(): number {
    return this.server.getMaxListeners();
  }

  listenerCount(type: string): number {
    return this.server.listenerCount(type);
  }
}

exports.createServer = function(): IServerProxy {
  const server = http.createServer();
  return new ServerProxy(server);
}

