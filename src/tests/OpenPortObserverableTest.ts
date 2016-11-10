import * as assert from 'assert';
import {SerialPortInterface} from '../SerialPortInterface';
import {SerialPortSpy} from './Mock/SerialPortSpy';
import {SerialPortOpenObservable} from '../SerialPortOpenObservable';
import {AsynchronousSerialPortSpy} from './Mock/AsynchronousSerialPortSpy';
import {Observable} from 'rxjs';

describe('openPortObservable', function () {
    let serialPortSpy: SerialPortSpy;
    let openPortObservable: SerialPortOpenObservable;

    beforeEach(() => {
        serialPortSpy = new AsynchronousSerialPortSpy(10);
        openPortObservable = new SerialPortOpenObservable(serialPortSpy);
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

    describe('getOpenPort open and close.', function () {

        it('Subscribe a single observer to the getOpenPort.', (callback) => {
            let received = [];

            openPortObservable.take(1).subscribe((port: SerialPortInterface) => {
                assert.ok(serialPortSpy.isOpen);
                assert.equal(port, serialPortSpy);
                received.push(1);
            });

            serialPortSpy.onCloseCallback = () => {
                assertPortOpenedAndClosed(1);
                assert.deepEqual(received, [1]);
                callback();
            };
        });

        it('Should open and close the port only a single time with multiple subscriptions', (callback) => {
            let received = [];

            openPortObservable.take(1).subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(1);
            });

            openPortObservable.take(1).subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(2);
            });

            serialPortSpy.onCloseCallback = () => {
                assertPortOpenedAndClosed(1);
                assert.deepEqual(received, [1, 2]);
                callback();
            };
        });

        it('It should reopen the port when previous subscription is closed ', (callback) => {
            Observable.interval(30).take(5).mergeMap((x) =>
                openPortObservable.take(1)
            ).bufferCount(5).subscribe((ports) => {
                assert.equal(ports.length, 5);
                assert.equal(serialPortSpy.timesPortOpened, 5);
                callback();
            });
        });

    });

});
