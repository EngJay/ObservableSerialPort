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

            assertPortClosed(1);
            assertPortOpened(1);
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

            assertPortClosed(1);
            assertPortOpened(1);
            assertPortReceived(2);
        });

        it('It should reopen the port when previous subscription is closed ', () => {
            let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });

            subscription1.unsubscribe();

            assertPortClosed(1);
            assertPortOpened(1);
            assertPortReceived(1);

            let subscription2 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
                assert.equal(port, serialPortSpy);
                timesPortReceived++;
            });
            subscription2.unsubscribe();

            assertPortClosed(2);
            assertPortOpened(2);
            assertPortReceived(2);
        });

    });

    describe('Use the send message observer.', () => {

        it('Be able to send a single message. (Direct call)', () => {
            observerSerialPort
                .send('test')
                .subscribe()
                .unsubscribe();

            assert.equal('test', serialPortSpy.lastSend, `Should have send the message`);

            assertPortClosed(1);
            assertPortOpened(1);
        });

        it('Be able to multiple messages.', () => {
            Observable
                .of('1', '2', '3')
                .concatMap(observerSerialPort.send())
                .subscribe()
                .unsubscribe();

            assert.deepEqual(['1', '2', '3'], serialPortSpy.dataSend);

            assertPortClosed(3);
            assertPortOpened(3);
        });

    });

});
