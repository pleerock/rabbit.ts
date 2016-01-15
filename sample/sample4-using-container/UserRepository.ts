import {Context} from "rabbit.js";
import {Resolve} from "typedi/Resolve";
import {RabbitLifecycleListener} from "../../src/Decorators";
import {RabbitContext} from "../../src/Decorators";
import {RabbitLifecycleListenerInterface} from "../../src/RabbitLifecycleListenerInterface";
import {User} from "./User";
import {RabbitHelper} from "../../src/RabbitHelper";

@Resolve()
export class UserRepository {

    constructor(private helper: RabbitHelper, @RabbitContext() private rabbitContext: Context) {
    }

    create(user: User): void {
        console.log('user created and dispatching event');
        this.helper.quickPublish(this.rabbitContext, 'user.create', user);
    }

}