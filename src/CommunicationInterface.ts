import {Observable} from 'rxjs';

interface CommunicationInterface<T>{

    send(message: T): Observable<void>;
    send(): (message: T) => Observable<void>;

    listen(): Observable<T>;
}

export {CommunicationInterface};
