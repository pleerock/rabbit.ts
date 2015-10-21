import {User} from "./User";
import {ContextManager} from "../../src/ContextManager";
import {RabbitHelper} from "../../src/RabbitHelper";
import {Container} from "typedi/Container";

require('./UserMessageQueue');

let contextManager = Container.get<ContextManager>(ContextManager);
contextManager.container = Container;
contextManager
    .createContext({ url: 'amqp://localhost' })
    .then(result => contextManager.loadListeners())
    .then(result => {
        let UserRepository = require('./UserRepository').UserRepository;
        let repository: any = Container.get(UserRepository);
        repository.create({ name: 'Mia', age: 18 });
        repository.create({ name: 'Mike', age: 25 });
    })
    .catch(err => console.error(err));
