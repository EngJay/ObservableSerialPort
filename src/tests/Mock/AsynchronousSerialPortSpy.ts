import {SerialPortSpy} from './SerialPortSpy';
import {SerialPortInterface} from '../../SerialPortInterface';

export class AsynchronousSerialPortSpy extends SerialPortSpy implements SerialPortInterface {

    constructor(public delayTime: number) {
        super();
    }

    open(callback: (err?: string) => void): void {
        setTimeout(() => {
            super.open(callback);
        }, this.delayTime);
    }

}
