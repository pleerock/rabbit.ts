import {Context, SubSocket, PubSocket, Socket} from "rabbit.js";

/**
 * Rabbit helper functions.
 */
export class RabbitHelper {

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Experimental. Creates a new PUBLISH socket, connects to a given queue, writes a given data and closes
     * connection. Makes object stringification if data is an object.
     */
    quickPublish(context: Context, queueName: string, data: any): Promise<void> {
        let socket = context.socket<PubSocket>('PUBLISH');
        return new Promise<void>((ok, fail) => {
            socket.connect(queueName, (err: any) => {
                if (err) {
                    fail(err);
                    return;
                }

                if (data instanceof Object)
                    data = JSON.stringify(data);

                socket.write(data, 'utf8');
                socket.close();
                ok();
            });
        });
    }

    /**
     * Experimental. Makes a subscription to the given queue on the given socket. Executes callback when
     * data is received. Performs json parsing of the received data.
     */
    quickSubscribe(socket: SubSocket, queueName: string, callback?: (data: any) => void): Promise<void> {
        return new Promise<void>((ok, fail) => {
            socket.connect(queueName, () => {
                socket.on('data', (data: any) => {
                    data = this.convert(data);
                    callback(data);
                });
                ok();
            });
        });
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private convert(data: any) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }

}