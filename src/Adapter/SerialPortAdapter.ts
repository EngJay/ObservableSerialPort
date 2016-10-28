import * as SerialPort from "serialport";
import {SerialPortInterface} from "../SerialPortInterface";

export class SerialPortAdapter implements SerialPortInterface {

    constructor(private port: SerialPort) {

    }

    onOpened(callback: () => void) {
        this.port.on('open', callback);
    }

    onData(callback: (message: string) => void) {
        this.port.on('data', callback);
    }

    onClose(callback: () => void) {
        this.port.on('close', callback);
    }

    onError(callback: (errorMessage: string) => void) {
        this.port.on('error', callback);
    }

    open(callback: (err: string) => void): void {
        this.port.open(<any>callback);
    }

    write(buffer: any, callback?: (err: string, bytesWritten: number) => void): void {
        this.port.write(buffer, callback);
    }

    close(callback?: (err:any) => void): void {
        this.port.close(callback);
    }

}

