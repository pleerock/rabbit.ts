import {Context} from "rabbit.js";

export interface RabbitLifecycleListenerInterface {

    /**
     * Called when connection to context is established.
     */
    onStart(context: Context): Promise<any>;

    /**
     * Called when connection to context is closed.
     */
    onTerminate(context: Context): Promise<any>;

}