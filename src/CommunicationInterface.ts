import {Subject, Observable} from 'rxjs';

interface CommunicationInterface<T> extends Subject<string>{

    /**
     * Send a message and returns the object when message has been send.
     */
    send(message: T): Observable<string>;
    send(): (message: T) => Observable<string>;

    /**
     * Alias for asObservable.
     */
    listen(): Observable<T>;
}

export {CommunicationInterface};
