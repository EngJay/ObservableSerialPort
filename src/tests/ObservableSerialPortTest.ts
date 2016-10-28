import * as assert from 'assert';
import {ObservableSerialPort} from '../ObservableSerialPort';
import {SerialPortInterface} from '../SerialPortInterface';
import {SerialPortSpy} from './Mock/SerialPortSpy';

describe('SerialPort', function () {
    let countPortReceived = 0;
    let serialPortSpy: SerialPortSpy;
    let observerSerialPort: ObservableSerialPort;

    beforeEach(() => {
        countPortReceived = 0;
        serialPortSpy = new SerialPortSpy();
        observerSerialPort = new ObservableSerialPort(serialPortSpy);
    });

    it('Should open and close the port', () => {
        let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, serialPortSpy);
            countPortReceived++;
        });

        subscription1.unsubscribe();

        assert.equal(countPortReceived, 1, 'The port should be received 1 time');
        assert.equal(serialPortSpy.countPortClosed, 1, 'The SerialPort should only be closed a single time');
        assert.equal(serialPortSpy.countPortOpened, 1, 'The SerialPort should only be opened a single time');
    });

    it('Should open and close the port only a single time', () => {
        let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, serialPortSpy);
            countPortReceived++;
        });

        let subscription2 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, serialPortSpy);
            countPortReceived++;
        });

        subscription1.unsubscribe();
        subscription2.unsubscribe();

        assert.equal(countPortReceived, 2, 'The next port should be received 2 times');
        assert.equal(serialPortSpy.countPortClosed, 1, 'The SerialPort should only be closed a single time');
        assert.equal(serialPortSpy.countPortOpened, 1, 'The SerialPort should only be opened a single time');
    });

    it('It should reopen the port when previous is closed ', () => {
        let subscription1 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, serialPortSpy);
            countPortReceived++;
        });

        subscription1.unsubscribe();

        assert.equal(countPortReceived, 2, 'The port should be received a single time');
        assert.equal(serialPortSpy.countPortClosed, 2, 'The SerialPort should only be closed 1 time');
        assert.equal(serialPortSpy.countPortOpened, 2, 'The SerialPort should only be opened 1 time');

        let subscription2 = observerSerialPort.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, serialPortSpy);
            countPortReceived++;
        });
        subscription2.unsubscribe();

        assert.equal(countPortReceived, 2, 'The port should be received 2 times');
        assert.equal(serialPortSpy.countPortClosed, 2, 'The SerialPort should only be closed 2 times');
        assert.equal(serialPortSpy.countPortOpened, 2, 'The SerialPort should only be opened 2 times');
    });
});
