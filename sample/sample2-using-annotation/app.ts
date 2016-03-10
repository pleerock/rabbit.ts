import {User} from "./User";
import {ContextManager} from "../../src/ContextManager";
import {UserMessageQueue} from "./UserMessageQueue";

require("./UserMessageQueue");  // its required in the case if you did not import the class

let contextManager = new ContextManager();
contextManager
    .createContext({ url: "amqp://localhost" })
    .then(result => contextManager.loadListeners())
    .then(result => {
        let subscriber = <UserMessageQueue> contextManager.getListener(UserMessageQueue);
        subscriber.publish("user.create", { name: "Dima", age: 24 });
    })
    .catch(err => console.error(err));
