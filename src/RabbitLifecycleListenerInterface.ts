import {Context} from "rabbit.js";

export interface RabbitLifecycleListenerInterface {

    /**
     * Called when connection to context is established.
     */
    onStart(context: Context): Promise<void>;

    /**
     * Called when connection to context is closed.
     */
    onTerminate(context: Context): Promise<void>;

}