
import {Observable, Subscriber, ReplaySubject, Subscription} from 'rxjs';
import {SerialPortInterface} from './SerialPortInterface';
import {TeardownLogic} from 'rxjs/Subscription';

/**
 * Returns serial port, and keep the port open as lone as there are subscribers.
 */
export class SerialPortOpenObservable extends Observable<SerialPortInterface> {

    private replaySubject: ReplaySubject<SerialPortInterface> = new ReplaySubject(1);

    private openPortSubscription: Subscription;

    constructor(private port: SerialPortInterface) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<SerialPortInterface>): TeardownLogic {
        if (this.replaySubject.observers.length === 0) {
            this.openPortSubscription = new Subscription();
            this.openPortSubscription.add(this.openPortObservable().subscribe(() => {
                this.replaySubject.next(this.port);
            }, err => this.replaySubject.error(err)));
            this.openPortSubscription.add(this.closePortObservable().subscribe(() => {
                this.replaySubject.complete();
            }, err => this.replaySubject.error(err)));
        }
        const subscription = this.replaySubject.subscribe(subscriber);
        return () => {
            subscription.unsubscribe();
            if (this.replaySubject.observers.length === 0) {
                this.port.close();
                this.openPortSubscription.unsubscribe();
                this.replaySubject = new ReplaySubject(1);
            }
        };
    }

    private openPortObservable(): Observable<void> {
        return Observable.bindNodeCallback<void>(this.port.open.bind(this.port))();
    }

    private closePortObservable(): Observable<void> {
        return Observable.bindNodeCallback<void>(this.port.onClose.bind(this.port))();
    }
}
