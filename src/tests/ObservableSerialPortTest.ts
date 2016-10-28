import * as assert from 'assert';
import {ObservableSerialPort} from "../ObservableSerialPort";
import {SerialPortInterface} from "../SerialPortInterface";



describe('SerialPort', function () {

    it('Should open and close the port', (callback) => {
        var countPortOpened = 0;
        var countPortRecieved = 0;
        var countPortClosed = 0;


        var mockedSerialPort = {
            open: (callback: Function) => {
                countPortOpened++;
                callback(null);
            },
            close: () => {
                countPortClosed++;

                assert.equal(countPortRecieved, 1, "The port should be received 1 time");
                assert.equal(countPortClosed, 1, "The SerialPort should only be closed a single time");
                assert.equal(countPortOpened, 1, "The SerialPort should only be opened a single time");
                callback();
            }
        };

        let observer = new ObservableSerialPort(<any> mockedSerialPort);

        var subscription1 = observer.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, mockedSerialPort);
            countPortRecieved++;
        });

        subscription1.unsubscribe();
    });

    it('Should open and close the port only a single time', (callback) => {
        var countPortOpened = 0;
        var countPortRecieved = 0;
        var countPortClosed = 0;


        var mockedSerialPort = {
            open: (callback: Function) => {
                countPortOpened++;
                callback(null);
            },
            close: () => {
                countPortClosed++;

                assert.equal(countPortRecieved, 2, "The next port should be received 2 times");
                assert.equal(countPortClosed, 1, "The SerialPort should only be closed a single time");
                assert.equal(countPortOpened, 1, "The SerialPort should only be opened a single time");
                callback();
            }
        };

        let observer = new ObservableSerialPort(<any> mockedSerialPort);

        var subscription1 = observer.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, mockedSerialPort);
            countPortRecieved++;
        });

        var subscription2 = observer.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, mockedSerialPort);
            countPortRecieved++;
        });

        subscription1.unsubscribe();
        subscription2.unsubscribe();
    });

    it('It should reopen the port when previous is closed ', (callback) => {
        var countPortOpened = 0;
        var countPortRecieved = 0;
        var countPortClosed = 0;


        var mockedSerialPort = {
            open: (callback: Function) => {
                countPortOpened++;
                callback(null);
            },
            close: () => {
                countPortClosed++;

                if (countPortClosed == 1) {
                    return;
                }
                assert.equal(countPortRecieved, 2, "The port should be received 2 times");
                assert.equal(countPortClosed, 2, "The SerialPort should only be closed 2 times");
                assert.equal(countPortOpened, 2, "The SerialPort should only be opened 2 times");
                callback();
            }
        };

        let observer = new ObservableSerialPort(<any> mockedSerialPort);

        var subscription1 = observer.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, mockedSerialPort);
            countPortRecieved++;
        });

        subscription1.unsubscribe();

        var subscription2 = observer.getPort().subscribe((port: SerialPortInterface) => {
            assert.equal(port, mockedSerialPort);
            countPortRecieved++;
        });
        subscription2.unsubscribe();
    });
});

