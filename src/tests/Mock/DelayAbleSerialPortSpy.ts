import {SerialPortSpy} from './SerialPortSpy';

export class DelayAbleSerialPortSpy extends SerialPortSpy {

    constructor(public delayTime: number) {
        super();
    }

    open(callback: (err?: string) => void): void {
        setTimeout(() => {
            super.open(callback);
        }, this.delayTime);
    }

    send(buffer: string, callback?: (err: string | null, bytesWritten: number) => void): void {
        if (!this.isOpen) {
            throw 'Port is not open';
        }

        setTimeout(() => {
            super.send(buffer, callback);
        }, this.delayTime);
    }

}
