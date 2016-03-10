import {defaultMetadataStorage} from "./MetadataStorage";
import {ContextManager} from "./ContextManager";

export function RabbitLifecycleListener(connectionName: string = "default"): Function {
    return function(object: Function) {
        defaultMetadataStorage.addRabbitLifecycleListenerMetadata({
            connectionName: connectionName,
            object: object
        });
    };
}

export function RabbitContext(contextName?: string): Function {
    return function(target: Function, key: string, index: number) {

        let container: any;
        try {
            container = require("typedi/Container").Container;
        } catch (err) {
            throw new Error("RabbitContext cannot be used because typedi package is not installed.");
        }

        container.registerParamHandler({
            type: target,
            index: index,
            getValue: () => {
                const connectionManager: ContextManager = container.get(ContextManager);
                return connectionManager.getContext(contextName);
            }
        });

    };
}
