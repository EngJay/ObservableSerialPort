import {CommunicationInterface} from './CommunicationInterface';
import {SerialPortInterface} from './SerialPortInterface';
import {Observable, Subscriber, AnonymousSubject, Subscription, ReplaySubject} from 'rxjs';

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
    protected portObserver: Observable<SerialPortInterface>;

    constructor(protected port: SerialPortInterface) {
        super();
        const queue = new ReplaySubject();
        queue.first().subscribe(() => {
            const openPortSubscription = this.getOpenPort().subscribe(() => {
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
        this.destination = queue;
    }

    /**
     * Sending a message and returns observer when message is completely send.
     */
    public send(message: string): Observable<string>;
    public send(): (message: string) => Observable<string>;
    public send(message?: string): any {
        if (!message) {
            return (message: string) => this.send(message);
        }
        let sendMessage: (message: string) => Observable<void> = Observable.bindNodeCallback<void>(this.port.send.bind(this.port));
        return this.getOpenPort().do(() => {
            console.log('open port');
        }, null, () => {
            console.log('close port');
        }).first().mergeMap(port => {
            console.log('Sending message');
            return sendMessage(message).do(() => {
                console.log('Message send');
            }, null, () => {
                console.log('Message send complete');
            });
        }).mapTo(message);
    }

    /**
     *  Needs to keep the port open when there are observers.
     *
     * TODO:
     *
     *    it need se only send the value single time for each new subscription
     *    but with keeping the subscription alive.
     *
     * @returns {Observable<SerialPortInterface>}
     */
    public getOpenPort(): Observable<SerialPortInterface> {
        if (!this.portObserver) {
            let observers = 0;
            let open = false;
            this.portObserver = Observable.create((subscriber: Subscriber<SerialPortInterface>) => {
                observers++;
                if (!open) {
                    this.port.open((err?: string) => {
                        if (err) {
                            subscriber.error(err);
                        } else {
                            open = true;
                            subscriber.next(this.port);
                        }
                    });
                } else {
                    subscriber.next(this.port);
                }
                return () => {
                    observers--;
                    if (observers === 0) {
                        open = false;
                        this.port.close();
                    }
                };
            });
        }
        return this.portObserver;
    }

    public listen(): Observable<string> {
        return this.asObservable();
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
        subscription.add(this.getOpenPort().subscribe(null, (err) => {
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
