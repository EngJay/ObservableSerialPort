export interface SerialPortInterface {

    onOpened(callback: () => void);
    onData(callback: (message: string) => void);
    onClose(callback: () => void);
    onError(callback: (errorMessage: string) => void);
    open(callback: (err?: string) => void): void;
    send(buffer: any, callback?: (err: string | null, bytesWritten: number) => void): void;
    close(callback?: (err: any) => void): void;

}
