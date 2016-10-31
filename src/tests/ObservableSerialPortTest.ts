import * as assert from 'assert';
import {ObservableSerialPort} from '../ObservableSerialPort';
import {SerialPortInterface} from '../SerialPortInterface';
import {SerialPortSpy} from './Mock/SerialPortSpy';
import {Observable} from 'rxjs';

describe('SerialPort', function () {
    let timesPortReceived = 0;
    let serialPortSpy: SerialPortSpy;
    let observerSerialPort: ObservableSerialPort;

    beforeEach(() => {
        timesPortReceived = 0;
        serialPortSpy = new SerialPortSpy();
        observerSerialPort = new ObservableSerialPort(serialPortSpy);
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
        assert.equal( serialPortSpy.isOpen, false, `The SerialPort should not be open`);
        assertPortOpened(times);
        assertPortClosed(times);
    }

    function assertPortReceived(times: number) {
        assert.equal(timesPortReceived, times, `The port should be received ${times} times not ${timesPortReceived} times`);
    }

    describe('Open and close port.', function () {

        it('Subscribe a single observer to the port.', () => {
            let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });

            subscription1.unsubscribe();

            assertPortOpenedAndClosed(1);
            assertPortReceived(1);
        });

        it.skip('Should open and close the port only a single time with multiple subscriptions', () => {
            let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });

            let subscription2 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });

            subscription1.unsubscribe();
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(1);
            assertPortReceived(2);
        });

        it('It should reopen the port when previous subscription is closed ', () => {
            let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });

            subscription1.unsubscribe();

            assertPortOpenedAndClosed(1);
            assertPortReceived(1);

            let subscription2 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });
            subscription2.unsubscribe();

            assertPortOpenedAndClosed(2);
            assertPortReceived(2);
        });

    });

    describe('Use the send message observer.', () => {

        it('Send a single message.', () => {
            observerSerialPort
                .send('test')
                .subscribe()
                .unsubscribe();

            assert.equal('test', serialPortSpy.lastSend, `Should have send the message`);

            assertPortOpenedAndClosed(1);
        });

        it('Be able to send multiple messages in same order.', () => {
            Observable
                .of('1', '2', '3')
                .concatMap(observerSerialPort.send())
                .subscribe()
                .unsubscribe();

            assert.deepEqual(['1', '2', '3'], serialPortSpy.dataSend);

            assertPortOpenedAndClosed(3);
        });

        it.skip('Be able to send multiple messages in any order.', (done) => {
            Observable
                .timer(10)
                .take(3)
                .map(x => `${x}`)
                .mergeMap(observerSerialPort.send())
                .subscribe(null, null,
                    () => {
                        assert.deepEqual(['0', '1', '2'], serialPortSpy.dataSend);

                        // TODO: this should be one, port should be open for the complete observer.
                        assertPortOpenedAndClosed(3);
                        done();
                    });
        });

    });

});
