import {Observable} from "rxjs";

interface CommunicationInterface<T>{

    send(data: T): Observable<T>;

    listen(): Observable<T>;
}

export {CommunicationInterface};
