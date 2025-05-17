class Node {
    async execute(message, context) {
        throw new Error('execute() must be implemented');
    }
}

class Selector extends Node {
    constructor(children) {
        super();
        this.children = children || [];
    }

    async execute(message, context) {
        for (const child of this.children) {
            const result = await child.execute(message, context);
            if (result) return true;
        }
        return false;
    }
}

class Sequence extends Node {
    constructor(children) {
        super();
        this.children = children || [];
    }

    async execute(message, context) {
        for (const child of this.children) {
            const result = await child.execute(message, context);
            if (!result) return false;
        }
        return true;
    }
}