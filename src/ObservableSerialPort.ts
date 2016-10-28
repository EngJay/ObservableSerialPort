import {CommunicationInterface} from './CommunicationInterface';
import {SerialPortInterface} from './SerialPortInterface';
import {Observable, Subscriber} from 'rxjs';

export class ObservableSerialPort implements CommunicationInterface<string> {

    /**
     * This is a shared observer for referencing the port.
     *
     * - Keeps the port open, when subscribed to multiple times.
     * - Closed the port when all subscriptions are gone.
     */
    private shared: Observable<SerialPortInterface>;

    constructor(private port: SerialPortInterface) {
        this.shared = Observable.create((subscriber: Subscriber<SerialPortInterface>) => {
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
        }).share();
    }

    /**
     * This return the serial port observer.
     *
     * It opens the port a single time when it is subscribed. And closes when nothing is subscribed any more.
     */
    public getPort(): Observable<SerialPortInterface> {
        return this.shared;
    }

    public send(data: string): Observable<string> {
        return null;
    }

    public listen(): Observable<string> {
        return null;
    }

}
