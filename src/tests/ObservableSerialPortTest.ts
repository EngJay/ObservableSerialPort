import * as assert from 'assert';
import {SerialPortSubject} from '../SerialPortSubject';
import {SerialPortInterface} from '../SerialPortInterface';
import {SerialPortSpy} from './Mock/SerialPortSpy';
import {Observable} from 'rxjs';
import {DelayAbleSerialPortSpy} from './Mock/DelayAbleSerialPortSpy';

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

    describe('getOpenPort open and close.', function () {

        it('Subscribe a single observer to the getOpenPort.', () => {
            let received = [];

            let subscription1 = serialPortSubject.getOpenPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(1);
            });

            subscription1.unsubscribe();

            assertPortOpenedAndClosed(1);
            assert.deepEqual(received, [1]);
        });

        it('Should open and close the port only a single time with multiple subscriptions', () => {
            let received = [];

            let subscription1 = serialPortSubject.getOpenPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(1);
            });

            let subscription2 = serialPortSubject.getOpenPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(2);
            });

            subscription1.unsubscribe();
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(1);
            assert.deepEqual(received, [1, 2]);
        });

        it('It should reopen the port when previous subscription is closed ', () => {
            let received = [];

            let subscription1 = serialPortSubject.getOpenPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(1);
            });

            subscription1.unsubscribe();

            assertPortOpenedAndClosed(1);
            assert.deepEqual(received, [1]);

            let subscription2 = serialPortSubject.getOpenPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                received.push(2);
            });
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(2);
            assert.deepEqual(received, [1, 2]);
        });

    });

    describe('subscribe should open and close the port.', function () {

        it('Subscribe a single observer to the port.', () => {
            serialPortSubject.subscribe().unsubscribe();
            assertPortOpenedAndClosed(1);
        });

        it('Should open and close the port only a single time with multiple subscriptions', () => {
            let subscription1 = serialPortSubject.subscribe();
            let subscription2 = serialPortSubject.subscribe();

            subscription1.unsubscribe();
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(1);
        });

        it('It should reopen the port when previous subscription is closed ', () => {
            let subscription1 = serialPortSubject.subscribe();
            subscription1.unsubscribe();

            assertPortOpenedAndClosed(1);

            let subscription2 = serialPortSubject.subscribe();
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(2);
        });

    });

    describe('Sending.', () => {

        it('Single message.', () => {
            Observable.of('test')
                .subscribe(serialPortSubject)
                .unsubscribe();

            assert.equal('test', serialPortSpy.lastSend, `Should have send the message`);

            assertPortOpenedAndClosed(1);
        });

        it('Wait for single message.', (callback) => {
            Observable.of('test')
                .concatMap(serialPortSubject.send())
                .subscribe((messageSend) => {
                        assert.equal('test', messageSend, `Should have send the message`);
                    }, null,
                    () => {
                        assertPortOpenedAndClosed(1);
                        callback();
                    }
                );
        });

        it('Multiple messages in same order.', () => {
            Observable
                .of('1', '2', '3')
                .subscribe(serialPortSubject)
                .unsubscribe();

            assert.deepEqual(['1', '2', '3'], serialPortSpy.dataSend);

            assertPortOpenedAndClosed(1);
        });

        it('Wait for async message.', (done) => {
            Observable
                .interval(10)
                .take(3)
                .map(x => `${x}`)
                .mergeMap(serialPortSubject.send())
                .subscribe(
                    null,
                    null,
                    () => {
                        assert.deepEqual(['0', '1', '2'], serialPortSpy.dataSend);

                        // TODO: this should be one, port should be open for the complete observer.
                        assertPortOpenedAndClosed(3);
                        done();
                    });
        });

    });

    describe('Sending with async callbacks.', () => {

        beforeEach(() => {
            serialPortSpy = new DelayAbleSerialPortSpy(10);
            serialPortSubject = new SerialPortSubject(serialPortSpy);
        });

        it.skip('Wait for single message.', (callback) => {
            Observable.of('test')
                .concatMap(serialPortSubject.send())
                .subscribe((messageSend) => {
                        assert.equal('test', messageSend, `Should have send the message`);
                    }, null,
                    () => {
                        assertPortOpenedAndClosed(1);
                        callback();
                    }
                );
        });

    });
});
