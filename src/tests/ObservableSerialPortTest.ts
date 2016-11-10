import * as assert from 'assert';
import {SerialPortSubject} from '../SerialPortSubject';
import {SerialPortSpy} from './Mock/SerialPortSpy';
import {Observable} from 'rxjs';
import {AsynchronousSerialPortSpy} from './Mock/AsynchronousSerialPortSpy';

describe('SerialPort', function () {
    let serialPortSpy: SerialPortSpy;
    let serialPortSubject: SerialPortSubject;

    beforeEach(() => {
        serialPortSpy = new SerialPortSpy();
        serialPortSubject = new SerialPortSubject(serialPortSpy);
    });

    function assertPortClosed(times: number) {
        assert.equal(serialPortSpy.timesPortClosed, times,
            `The SerialPort should only be closed ${times} times not ${serialPortSpy.timesPortClosed} times`
        );
    }

    function assertPortOpened(times: number) {
        assert.equal(serialPortSpy.timesPortOpened, times,
            `The SerialPort should only be opened ${times} times not ${serialPortSpy.timesPortOpened} times`
        );
    }

    function assertPortOpenedAndClosed(times: number) {
        assert.equal(serialPortSpy.isOpen, false, `The SerialPort should not be open`);
        assertPortOpened(times);
        assertPortClosed(times);
    }

    describe('Sending.', () => {

        it('Single message.', () => {
            Observable.of('test')
                .subscribe(serialPortSubject)
                .unsubscribe();

            assert.equal('test', serialPortSpy.lastSend, `Should have send the message`);

            assertPortOpenedAndClosed(1);
        });

        it('Multiple messages in same order.', () => {
            Observable
                .of('1', '2', '3')
                .subscribe(serialPortSubject)
                .unsubscribe();

            assert.deepEqual(['1', '2', '3'], serialPortSpy.dataSend);

            assertPortOpenedAndClosed(1);
        });
    });

    describe('Receiving.', () => {
        it.skip('Single message.', () => {
            let received: string[] = [];

            serialPortSubject
                .subscribe((message) => {
                    received.push(message);
                });

            serialPortSpy.onDataCallback('test');

            assert.deepEqual(received, ['test']);

            assertPortOpenedAndClosed(1);
        });
    });

    describe('Sending with async callbacks.', () => {

        beforeEach(() => {
            serialPortSpy = new AsynchronousSerialPortSpy(10);
            serialPortSubject = new SerialPortSubject(serialPortSpy);
        });

    });
});
