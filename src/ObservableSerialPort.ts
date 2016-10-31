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
                .concatMap(port => sendMessage(message))
                .map(x => message)
                .take(1);
        }
        return (message: string) => this.send(message);
    }

    public listen(): Observable<string> {
        return null;
    }

}
