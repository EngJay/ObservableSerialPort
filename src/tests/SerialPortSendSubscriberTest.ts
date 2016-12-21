import * as assert from 'assert';
import {SerialPortSendSubscriber} from '../SerialPortSendSubscriber';
import {SerialPortOpenObservable} from '../SerialPortOpenObservable';
import {AsynchronousSerialPortSpy} from './Mock/AsynchronousSerialPortSpy';

describe('SerialPortSendSubscriber', function () {
    let serialPortSpy: AsynchronousSerialPortSpy;
    let serialPort: SerialPortSendSubscriber;

    beforeEach(() => {
        serialPortSpy = new AsynchronousSerialPortSpy(10);
        serialPort = new SerialPortSendSubscriber(new SerialPortOpenObservable(serialPortSpy));
    });

    describe('Sending.', () => {

        it('Multiple messages.', (callback) => {
            serialPortSpy.onCloseCallback = () => {
                assert.deepEqual(serialPortSpy.dataSend, ['test1', 'test2']);
                callback();
            };
            serialPort.next('test1');
            serialPort.next('test2');
            setTimeout(() => serialPort.complete(), 30);
        });

    });
});
