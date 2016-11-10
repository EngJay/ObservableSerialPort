import {CommunicationInterface} from './CommunicationInterface';
import {SerialPortInterface} from './SerialPortInterface';
import {Observable, Subscriber, AnonymousSubject, Subscription, ReplaySubject} from 'rxjs';
import {SerialPortOpenObservable} from './SerialPortOpenObservable';

export class SerialPortSubject extends AnonymousSubject<string> implements CommunicationInterface<string> {
    /**
     * Just a reference that there could
     */
    protected source: Observable<string>;

    /**
     * This is a portObserver observer for referencing the port.
     *
     * - Keeps the port open, when subscribed to multiple times.
     * - Closed the port when all subscriptions are gone.
     */
    protected portObserver: SerialPortOpenObservable;

    constructor(protected port: SerialPortInterface) {
        super();
        this.portObserver = new SerialPortOpenObservable(port);
        const queue = new ReplaySubject();
        queue.first().subscribe(() => {
            const openPortSubscription = this.portObserver.subscribe(() => {
                // We are open, and can attach the send data from replay queue.
                let queue: ReplaySubject<string> = <any> this.destination;
                this.destination = new Subscriber<string>((message) => {
                        this.port.send(message, (e) => {
                            if (e) {
                                this.error(e);
                            }
                        });
                    },
                    (err) => this.error(err),
                    () => openPortSubscription.unsubscribe()
                );
                queue.subscribe(this);
                queue.unsubscribe();
            }, (err) => this.error(err));

            return () => {
                // If the subscription get closed before we have changed the port destination.
                if (this.destination instanceof ReplaySubject) {
                    openPortSubscription.unsubscribe();
                }
            };
        });
        // Receive messages.
        this.port.onData((message) => {
            this.next(message);
        });
        this.destination = queue;
    }

    /**
     * @param subscriber
     * @returns {Subscription}
     * @private
     */
    protected _subscribe(subscriber: Subscriber<string>): Subscription {
        let subscription: Subscription;
        if (this.source) {
            subscription = super._subscribe(subscriber);
        } else {
            subscription = new Subscription();
        }
        // listen for opening the port.
        subscription.add(this.portObserver.subscribe(null, (err) => {
            this.error(err);

        }));
        return subscription;
    }

    unsubscribe() {
        super.unsubscribe();

        if (!this.source) {
            this.destination = new ReplaySubject();
        }
    }
}
