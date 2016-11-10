
import {Observable, Subscriber, ReplaySubject, Subscription} from 'rxjs';
import {SerialPortInterface} from './SerialPortInterface';
import {TeardownLogic} from 'rxjs/Subscription';

/**
 * Returns serial port, and keep the port open as lone as there are subscribers.
 */
export class SerialPortOpenObservable extends Observable<SerialPortInterface> {

    private replaySubject: ReplaySubject<SerialPortInterface> = new ReplaySubject(1);

    /**
     * This is the open port Subscription.
     */
    private openPort: Subscription;

    constructor(private port: SerialPortInterface) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<SerialPortInterface>): TeardownLogic {
        let subscription = this.replaySubject.subscribe(subscriber);
        if (!this.openPort) {
            this.openPort = this.openPortObservable().subscribe(() => {
                this.replaySubject.next(this.port);
            }, err => this.replaySubject.error(err));
        }
        return () => {
            subscription.unsubscribe();
            if (this.replaySubject.observers.length === 0) {
                this.port.close();
                this.openPort.unsubscribe();
                this.openPort = null;
                this.replaySubject = new ReplaySubject(1);
            }
        };
    }

    private openPortObservable(): Observable<void> {
        return Observable.bindNodeCallback<void>(this.port.open.bind(this.port))();
    }
}
