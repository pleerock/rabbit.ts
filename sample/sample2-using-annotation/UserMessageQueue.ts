import {Context, SubSocket, PubSocket} from "rabbit.js";
import {RabbitLifecycleListenerInterface} from "../../src/RabbitLifecycleListenerInterface";
import {RabbitLifecycleListener} from "../../src/Decorators";
import {User} from "./User";

@RabbitLifecycleListener()
export class UserMessageQueue implements RabbitLifecycleListenerInterface {

    private context: Context;
    private subscribeSocket: SubSocket;

    onStart(context: Context): Promise<void> {
        this.context = context;
        this.subscribeSocket = this.context.socket<SubSocket>("SUBSCRIBE");
        return Promise.all(this.subscribeAll()).then(() => { });
    }

    onTerminate(context: Context): Promise<void> {
        if (this.subscribeSocket)
            this.subscribeSocket.close();

        return Promise.resolve<void>(undefined);
    }

    publish(queueName: string, object: any): Promise<void> {
        let socket = this.context.socket<PubSocket>("PUBLISH");
        return new Promise<void>((ok, fail) => {
            socket.connect(queueName, (err: any) => {
                if (err) {
                    fail(err);
                    return;
                }

                socket.write(JSON.stringify(object), "utf8");
                socket.close();
                ok();
            });
        });
    }

    private subscribeAll(): Promise<void>[] {
        return [
            this.subscribe("user.create", function(user: User) {
                console.log("User " + user.name + " created");
            })
        ];
    }

    private subscribe(queueName: string, callback: (data: any) => void): Promise<void> {
        return new Promise<void>((ok, fail) => {
            this.subscribeSocket.connect(queueName, () => {
                this.subscribeSocket.on("data", (data: any) => callback(JSON.parse(data)));
                ok();
            });
        });
    }

}