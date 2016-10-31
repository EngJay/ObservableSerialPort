import {CommunicationInterface} from './CommunicationInterface';
import {SerialPortInterface} from './SerialPortInterface';
import {Observable, Subscriber} from 'rxjs';

export class ObservableSerialPort implements CommunicationInterface<string> {

    /**
     * This is a portObserver observer for referencing the port.
     *
     * - Keeps the port open, when subscribed to multiple times.
     * - Closed the port when all subscriptions are gone.
     */
    private portObserver: Observable<SerialPortInterface>;

    private dataObserver: Observable<string>;

    constructor(private port: SerialPortInterface) {
        // TODO: this looks like a hack.., could this be solved by something.
        let observers = 0;
        this.portObserver = Observable.create((subscriber: Subscriber<SerialPortInterface>) => {
            observers++;
            if (observers === 1) {
                this.port.open((err?: string) => {
                    if (err) {
                        subscriber.error(err);
                    } else {
                        subscriber.next(this.port);
                    }
                });
            } else {
                subscriber.next(this.port);
            }
            return () => {
                observers--;
                if (observers === 0) {
                    this.port.close();
                }
            };
        });
        this.dataObserver = Observable.bindNodeCallback<string>(this.port.onData.bind(this.port))();
    }

    public getPort(): Observable<SerialPortInterface> {
        return this.portObserver;
    }

    /**
     * Send message and return on complete observer.
     */
    public send(message: string): Observable<void>;
    public send(): (message: string) => Observable<void>;
    public send(message?: string): any {
        if (message) {
            let sendMessage: (message: string) => Observable<void> = Observable.bindNodeCallback<void>(this.port.send.bind(this.port));
            return this.getPort()
                .take(1)
                .mergeMap(port => sendMessage(message))
                .map(x => message);
        }
        return (message: string) => this.send(message);
    }

    /**
     * Listen to messages.
     *
     * @returns {any}
     */
    public listen(): Observable<string> {
        return this.getPort().mergeMap(port => this.dataObserver);
    }

}
