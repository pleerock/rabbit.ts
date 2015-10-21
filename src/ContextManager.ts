import {RabbitLifecycleListenerInterface} from "./RabbitLifecycleListenerInterface";
import {CreateContextOptions} from "./CreateContextOptions";
import {defaultMetadataStorage} from "./MetadataStorage";
import * as rabbit from "rabbit.js";
import {Context} from "rabbit.js";
import {MetadataStorage} from "./MetadataStorage";

interface Connection {
    name: string;
    context: Context;
    listeners: RabbitLifecycleListenerInterface[];
}

export class ContextManager {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private connections: Connection[] = [];
    private metadataStorage: MetadataStorage;
    private _container: { get(someClass: any): any };

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(metadataStorage?: MetadataStorage) {
        this.metadataStorage = metadataStorage ? metadataStorage : defaultMetadataStorage;
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Sets a container that can be used in initializers.
     * This allows to inject container services into listeners.
     */
    set container(container: { get(someClass: any): any }) {
        this._container = container;
    }

    // -------------------------------------------------------------------------
    // Adders
    // -------------------------------------------------------------------------

    getContext(name: string = 'default'): Context {
        return this.getConnection(name).context;
    }

    addContext(context: Context): void;
    addContext(name: string, context: Context): void;
    addContext(contextOrName: any|string, context?: Context): void {
        let name = 'default';
        if (contextOrName instanceof String) {
            name = contextOrName;
        } else {
            context = <Context> contextOrName;
        }

        this.connections.push(<Connection> { name: name, context: context, listeners: [] });
    }

    createContext(options: CreateContextOptions): Promise<void>;
    createContext(name: string, options: CreateContextOptions): Promise<void>;
    createContext(nameOrOptions: string|CreateContextOptions, options?: CreateContextOptions): Promise<void> {
        let name = 'default';
        if (nameOrOptions instanceof String) {
            name = nameOrOptions;
        } else {
            options = <CreateContextOptions> nameOrOptions;
        }

        let connection: Connection = { name: name, context: rabbit.createContext(options.url), listeners: [] };
        this.connections.push(connection);
        return new Promise<void>((ok, fail) => {
            connection.context.on('ready', ok);
            connection.context.on('error', fail);
        });
    }

    closeContext(contextName: string = 'default'): Promise<void> {
        let connection = this.getConnection(contextName);
        let stopPromises = this.terminateListeners(connection);
        let closePromise = new Promise<void>(ok => {
            connection.context.close(() => {});
            ok();
            // since rabbit.js library does not validate close errors we cant wait for connection close and create
            // a promise for it - because in the case if close fail we cant know about it and promise never be resolved
        });
        return Promise.all(stopPromises.concat(closePromise)).then(_ => {});
    }

    closeContexts(): Promise<void> {
        return Promise.all(this.connections.map(connection => this.closeContext(connection.name))).then(_ => {});
    }

    registerListener(listener: RabbitLifecycleListenerInterface): Promise<void>;
    registerListener(contextName: string, listener: RabbitLifecycleListenerInterface): Promise<void>;
    registerListener(nameOrListener: string|RabbitLifecycleListenerInterface, listener?: RabbitLifecycleListenerInterface): Promise<void> {
        let contextName = 'default';
        if (nameOrListener instanceof String) {
            contextName = nameOrListener;
        } else {
            listener = <RabbitLifecycleListenerInterface> nameOrListener;
        }

        let connection = this.getConnection(contextName);
        connection.listeners.push(listener);
        return listener.onStart(connection.context);
    }

    getListener(objectConstructor: Function): RabbitLifecycleListenerInterface;
    getListener(contextName: string, objectConstructor: Function): RabbitLifecycleListenerInterface;
    getListener(contextNameOrObjectConstructor: string|Function, objectConstructor?: Function): RabbitLifecycleListenerInterface {
        let contextName = 'default';
        if (contextNameOrObjectConstructor instanceof String) {
            contextName = contextNameOrObjectConstructor;
        } else {
            objectConstructor = <Function> contextNameOrObjectConstructor;
        }

        let connection = this.getConnection(contextName);
        return connection.listeners.reduce((found, listener) => {
            return listener.constructor === objectConstructor ? listener : found;
        }, undefined);
    }

    loadListeners(): Promise<void> {
        return Promise.all(this.connections.map(connection => {
            this.loadListenersFromMetadataStorage(connection);
            return Promise.all(this.startListeners(connection));
        })).then(() => { });
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private getConnection(contextName: string): Connection {
        let connection = this.connections.reduce((found, context) => context.name === contextName ? context : found, undefined);
        if (!connection)
            throw new Error('No rabbit context "' + contextName + '" was found.');

        return connection;
    }

    private loadListenersFromMetadataStorage(connection: Connection): void {
        this.metadataStorage.rabbitLifecycleListenerMetadatas
            .filter(metadata => metadata.connectionName === connection.name)
            .forEach(metadata => connection.listeners.push(this.obtainListener(metadata.object)));
    }

    private startListeners(connection: Connection): Promise<void>[] {
        return connection.listeners.map(listener => listener.onStart(connection.context));
    }

    private terminateListeners(connection: Connection): Promise<void>[] {
        return connection.listeners.map(listener => listener.onTerminate(connection.context));
    }
    
    private obtainListener(constructor: Function): RabbitLifecycleListenerInterface {
        return this._container ? this._container.get(constructor) : new (<any>constructor)();
    }

}
