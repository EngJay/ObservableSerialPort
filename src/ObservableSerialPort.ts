import {CommunicationInterface} from "./CommunicationInterface";
import {SerialPortInterface} from "./UartInterface";
import {Observable, Subscriber} from "rxjs";

export class ObservableSerialPort implements CommunicationInterface<string> {

    /**
     * This is a shared observer for referencing the port.
     *
     * - Keeps the port open, when subscribed to multple times.
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
        // return this.getPort().subscribe();
    }

    public listen(): Observable<string> {
        return null;
    }

//
//     public send(data: string): this {
//
//
//
//
//         let successCallback = Observable.bindCallback((err, bytesWritten, cb) => {
//
//         });
//
//         myPort.write(data, successCallback);
//
//         return this;
//     }
//
//     public observer(): Observable<string> {
//
// //         var serialport = require('serialport'),// include the library
// //             SerialPort = serialport.SerialPort,    // make a local instance of it
// //             portName = process.argv[2],            // get port name from the command line
// //             datarate = parseInt(process.argv[3], 10);
// //
// //         var myPort = new SerialPort(portName, {
// //             baudRate: datarate,
// //             // look for return and newline at the end of each data packet:
// //             parser: serialport.parsers.readline('\r\n')
// //         });
// //
// // // these are the definitions for the serial events:
// //         myPort.on('open', showPortOpen);
// //         myPort.on('data', saveLatestData);
// //         myPort.on('close', showPortClose);
// //         myPort.on('error', showError);
//     }
//


}

