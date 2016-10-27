
export interface SerialPortInterface {

    onOpened(callback: () => void);
    onData(callback: (message: string) => void);
    onClose(callback: () => void);
    onError(callback: (errorMessage: string) => void);

    open(callback: (err: string) => void): void;
    write(buffer: any, callback?: (err: string, bytesWritten: number) => void): void
    close(callback?: (err:any) => void): void;

}
