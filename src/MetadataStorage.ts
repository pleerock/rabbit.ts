import {RabbitLifecycleListenerMetadata} from "./RabbitLifecycleListenerMetadata";
import {RabbitLifecycleListenerInterface} from "./RabbitLifecycleListenerInterface";

/**
 * Storage metadatas.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _rabbitLifecycleListenerMetadatas: RabbitLifecycleListenerMetadata[] = [];

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Gets all lifecycle listeners that are added to this storage.
     */
    get rabbitLifecycleListenerMetadatas(): RabbitLifecycleListenerMetadata[] {
        return this._rabbitLifecycleListenerMetadatas;
    }

    // -------------------------------------------------------------------------
    // Adder Methods
    // -------------------------------------------------------------------------

    /**
     * Adds a new lifecycle listener metadata.
     */
    addRabbitLifecycleListenerMetadata(metadata: RabbitLifecycleListenerMetadata): void {
        this._rabbitLifecycleListenerMetadatas.push(metadata);
    }

}

/**
 * Default action storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();