import {Observable, Subscription, Subscriber} from 'rxjs';
import {TeardownLogic} from 'rxjs/Subscription';
import {SerialPortOpenObservable} from './SerialPortOpenObservable';

/**
 * Observable to send messages, and when for the message to be send.
 */
export class SerialPortSendObservable extends Observable<string> {

    private openPort: Subscription;

    constructor(private openPort: SerialPortOpenObservable, private message?: string) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<string>): TeardownLogic {
        if (!this.message) {
            throw new Error('Cannot subscribe on SerialPortSendObservable when no message given.');
        }
        const subscription = this.openPort.subscribe((port) => {
            const sendMessage: (message: string) => Observable<number> = Observable.bindNodeCallback<number>(port.send.bind(port));
            sendMessage(this.message).subscribe((length: number) => {
                subscriber.next(this.message);
                subscriber.complete();
            }, err => subscriber.error(err));
        }, err => subscriber.error(err));
        return () => {
            subscription.unsubscribe();
        };
    }

    /**
     * Create a new observable with a new message.
     *
     * @param message
     */
    public send(message: string): Observable<string>;
    public send(): (message: string) => Observable<string>;
    public send(message?: string): any {
        if (!message) {
            return (message: string) => this.send(message);
        }
        return new SerialPortSendObservable(this.openPort, message);
    }

}

