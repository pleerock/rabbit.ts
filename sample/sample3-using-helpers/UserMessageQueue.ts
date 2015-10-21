import {Context, SubSocket, PubSocket} from "rabbit.js";
import {RabbitLifecycleListenerInterface} from "../../src/RabbitLifecycleListenerInterface";
import {RabbitLifecycleListener} from "../../src/Annotations";
import {User} from "./User";
import {RabbitHelper} from "../../src/RabbitHelper";

@RabbitLifecycleListener()
export class UserMessageQueue implements RabbitLifecycleListenerInterface {

    private context: Context;
    private subscribeSocket: SubSocket;
    private helper: RabbitHelper;

    constructor() {
        this.helper = new RabbitHelper();
    }

    onStart(context: Context): Promise<any> {
        this.context = context;
        this.subscribeSocket = this.context.socket<SubSocket>('SUBSCRIBE');
        return Promise.all(this.subscribeAll());
    }

    onTerminate(context: Context): Promise<any> {
        if (this.subscribeSocket)
            this.subscribeSocket.close();

        return Promise.resolve();
    }

    private subscribeAll(): Promise<void>[] {
        return [
            this.helper.quickSubscribe(this.subscribeSocket, 'user.create', function(user: User) {
                console.log('User ' + user.name +' created');
            })
        ];
    }

}