import {Subscriber, ReplaySubject, Subscription, Operator} from 'rxjs';
import {SerialPortOpenObservable} from './SerialPortOpenObservable';
import {PartialObserver} from 'rxjs/Observer';

/**
 * Sending date with serial port.
 */
export class SerialPortSendSubscriber extends Subscriber<string> {

    /**
     * Temporary destiontion
     * @type {ReplaySubject}
     */
    protected destination: PartialObserver<string> = new ReplaySubject();

    /**
     * Keeps the subscription as long this subscriber is getting values.
     */
    protected openPortSubscription: Subscription;

    constructor(private openPort: SerialPortOpenObservable) {
        super();
    }

    protected _next(value: string) {
        super._next(value);
        if (this.openPortSubscription) {
            return;
        }
        this.openPortSubscription = this.openPort.subscribe((port) => {
            // We are open, and can attach the send data from replay queue.
            let queue: ReplaySubject<string> = <any> this.destination;
            this.destination = new Subscriber<string>((message) => {
                    port.send(message, (e) => {
                        if (e) {
                            this.error(e);
                        }
                    });
                },
                (err) => this.error(err)
            );
            queue.subscribe(this);
        }, (err) => this.error(err));
    }

    protected _complete() {
        super._complete();
        if (this.openPortSubscription) {
            this.openPortSubscription.unsubscribe();
            this.openPortSubscription = null;
        }
        this.destination = new ReplaySubject();
    }

}
