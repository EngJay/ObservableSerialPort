import {SerialPortInterface} from '../../SerialPortInterface';

export class SerialPortSpy implements SerialPortInterface {

    public timesPortOpened = 0;
    public countPortReceived = 0;
    public timesPortClosed = 0;
    public isOpen: boolean = false;
    public onOpenCallback: () => void;
    public onCloseCallback: () => void;
    public onErrorCallback: (error: string) => void;
    public onDataCallback: (message: string) => void;

    public dataSend: string[] = [];
    public lastSend: string;

    onOpened(callback: () => void) {
        this.countPortReceived += 1;
        this.onOpenCallback = callback;
    }

    onData(callback: (message: string) => void) {
        this.onDataCallback = callback;
    }

    onClose(callback: () => void) {
        this.onCloseCallback = callback;
    }

    onError(callback: (errorMessage: string) => void) {
        this.onErrorCallback = callback;
    }

    open(callback: (err?: string) => void): void {
        this.timesPortOpened += 1;
        this.isOpen = true;
        callback();
        if (this.onOpenCallback) {
            this.onOpenCallback();
        }
    }

    send(buffer: string, callback?: (err: string | null, bytesWritten: number) => void): void {
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        this.dataSend.push(buffer);
        this.lastSend = buffer;
        callback(null, buffer.length);
    }

    close(callback?: (err: any) => void): void {
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        this.timesPortClosed += 1;
        this.isOpen = false;
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

}
