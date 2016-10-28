import {SerialPortInterface} from '../../SerialPortInterface';

export class SerialPortSpy implements SerialPortInterface {

    public countPortOpened = 0;
    public countPortReceived = 0;
    public countPortClosed = 0;
    public isOpen: boolean = false;
    public opOpenCallback: () => void;
    public opCloseCallback: () => void;
    public opErrorCallback: (error: string) => void;
    public opDataCallback: (message: string) => void;

    public dataSend: string[] = [];
    public lastSend: string;

    onOpened(callback: () => void) {
        this.countPortReceived += 1;
        this.opOpenCallback = callback;
    }

    onData(callback: (message: string) => void) {
        this.opDataCallback = callback;
    }

    onClose(callback: () => void) {
        this.opCloseCallback = callback;
    }

    onError(callback: (errorMessage: string) => void) {
        this.opErrorCallback = callback;
    }

    open(callback: (err?: string) => void): void {
        this.countPortOpened += 1;
        this.isOpen = true;
        callback();
        if (this.opOpenCallback) {
            this.opOpenCallback();
        }
    }

    send(buffer: string, callback?: (err: string | null, bytesWritten: number) => void): void {
        this.dataSend.push(buffer);
        this.lastSend = buffer;
        callback(null, buffer.length);
    }

    close(callback?: (err: any) => void): void {
        this.countPortClosed += 1;
        this.isOpen = false;
        if (this.opCloseCallback) {
            this.opCloseCallback();
        }
    }

}
