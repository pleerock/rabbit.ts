import {User} from "./User";
import {ContextManager} from "../../src/ContextManager";
import {RabbitHelper} from "../../src/RabbitHelper";

require('./UserMessageQueue');

let contextManager = new ContextManager();
let helper = new RabbitHelper();
contextManager
    .createContext({ url: 'amqp://localhost' })
    .then(result => contextManager.loadListeners())
    .then(result => {
        helper.quickPublish(contextManager.getContext(), 'user.create', { name: 'Lenny', age: 24 });
    })
    .catch(err => console.error(err));
