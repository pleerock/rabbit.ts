import {User} from "./User";
import {ContextManager} from "../../src/ContextManager";
import {UserMessageQueue} from "./UserMessageQueue";

let subscriber = new UserMessageQueue();
let contextManager = new ContextManager();
contextManager
    .createContext({ url: "amqp://localhost" })
    .then(result => contextManager.registerListener(subscriber))
    .then(result => {
        console.log("lets publish edit message.");
        subscriber.publish("user.edit", { name: "Dima", age: 24 });
        console.log("published.");
    })
    .catch(err => console.error(err));
