const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

const userContexts = new Map();

const friendsDict = {
    '593969341047@c.us': {
        name: "Jairo",
        nickName: "Hairin",
        greetings: "Hairin, uggghhhh, hola"
    },
    '593995727505@c.us': {
        name: "Milton",
        nickName: "Melman",
        greetings: "Hola Melman ! Cómo estas ?"
    },
    '5511958684395@c.us': {
        name: "Ligia",
        nickName: "Li",
        greetings: "Oi Li tudo bem"
    },
    '593991367161@c.us': {
        name: "Vicky",
        nickName: "Victoria",
        greetings: "Hola Vicky !"
    }
};

// Behavior Tree Nodes
class BehaviorTree {
    constructor() {
        this.root = new Selector([
            new DailyGreeting(),
            new HandleDogCount(),
            new HandleMenuSelection(),
            new DefaultResponse()
        ]);
    }

    async execute(message, context) {
        await this.root.execute(message, context);
    }
}

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

// Concrete Behavior Nodes
class DailyGreeting extends Node {
    async execute(message, context) {
        const today = new Date().toISOString().split('T')[0];
        if (context.lastGreetDate === today) return false;

        context.lastGreetDate = today;
        const friend = friendsDict[message.from];

        if (friend) {
            await client.sendMessage(message.from, friend.greetings);
            context.friend = friend;
            context.isFriend = true;
            
            if (message.body.includes("gay")) {
                await client.sendMessage(message.from, 'Gay el que se tragó tu papá anoche, mientras tu jefa me aplaudía.');
            }
        } else {
            await client.sendMessage(message.from, 'Ha ingresado al servicio telefonico automatizado de la marina');
            await client.sendMessage(message.from, 'Calamardo los robots tomaron el control de la marina !!!!');
        }

        await client.sendMessage(message.from, 'Presione 1 para chismes');
        await client.sendMessage(message.from, 'Presione 2 para trabajo');
        await client.sendMessage(message.from, 'Presione 3 para hablar con el perro');
        await client.sendMessage(message.from, 'Presione 4 para hablar con Iván');

        return true;
    }
}

class HandleDogCount extends Node {
    async execute(message, context) {
        if (context.dogCount > 0) {
            await client.sendMessage(message.from, getRandomGuauString());
            context.dogCount = context.dogCount - 1;
            return true;
        }
        return false;
    }
}

class HandleMenuSelection extends Node {
    async execute(message, context) {
        const content = message.body.trim();
        
        // Update selected option
        if (/^\d+$/.test(content)) {
            context.selectedOption = parseInt(content, 10);
        } else {
            context.selectedOption = 0;
        }

        switch (context.selectedOption) {
            case 1:
                await this.handleOption1(message, context);
                return true;
            case 2:
                await client.sendMessage(message.from, 'Describa su mensaje por favor con su nombre y detalle por favor :)');
                return true;
            case 3:
                const randomNumber = Math.floor(Math.random() * 30) + 1;
                await client.sendMessage(message.from, `El siguiente perro estará disponible en ${randomNumber} minutos`);
                context.dogCount = 5;
                return true;
            case 4:
                await client.sendMessage(message.from, 'espere....');
                return true;
            default:
                return false;
        }
    }

    async handleOption1(message, context) {
        await client.sendMessage(message.from, 'Felicidades has presionado chismes!!');
        if (context.friend?.name === "Vicky") {
            await client.sendMessage(message.from, 'Hola Victoria, envia 1V para chismes normales, envia 2V para chismes de mi ex');
        }
        await client.sendMessage(message.from, 'Envia Chisme1 para saber sobre mi vida amorosa, Chime2 para saber de mi vida laboral, Chime3 para saber de mi :)');
    }
}

class DefaultResponse extends Node {
    async execute(message, context) {
        // Update last message time for all messages
        context.lastMessageTime = Date.now();
        return true;
    }
}

// Helper function
function getRandomGuauString(min = 1, max = 10) {
    const times = Math.floor(Math.random() * (max - min + 1)) + min;
    return 'guau '.repeat(times);
}

// Initialize behavior tree
const behaviorTree = new BehaviorTree();

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async (message) => {
    console.log(`Mensaje recibido de ${message.pushname} :::: ${message.from}: ${message.body}`);

    const userId = message.from;

    // Initialize context if user is new
    if (!userContexts.has(userId)) {
        userContexts.set(userId, { 
            lastMessageTime: Date.now(), 
            lastGreetDate: null, 
            selectedOption: 0, 
            isFriend: false,
            dogCount: 0
        });
    }

    const context = userContexts.get(userId);
    await behaviorTree.execute(message, context);
});

client.initialize();