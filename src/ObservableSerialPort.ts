import {CommunicationInterface} from './CommunicationInterface';
import {SerialPortInterface} from './SerialPortInterface';
import {Observable, Subscriber, Subject} from 'rxjs';

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
        this.portObserver = Observable.create((subscriber: Subscriber<SerialPortInterface>) => {
            this.port.open((err?: string) => {
                if (err) {
                    subscriber.error(err);
                } else {
                    subscriber.next(this.port);
                }
            });
            return () => {
                this.port.close();
            };
        }).multicast(new Subject()).refCount();

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
            return this.getPort().take(1)
                .mergeMap(port => sendMessage(message))
                // TODO: is there a cleaner way to pass the message instead of the port?
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
        return this.getPort().mergeMap(port => this.dataObserver) ;
    }

}
