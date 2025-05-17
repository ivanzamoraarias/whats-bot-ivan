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
}

function getRandomGuauString(min = 1, max = 10) {
    const times = Math.floor(Math.random() * (max - min + 1)) + min;
    return 'guau '.repeat(times);
}

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});


client.on('message', async (message) => {
    console.log(`Mensaje recibido de ${message.pushname} :::: ${message.from}: ${message.body}`);

    const userId = message.from;

    // Initialize context if user is new
    if (!userContexts.has(userId)) {
        userContexts.set(userId, { lastMessageTime: Date.now(), greetedToday: false, selectedOption: 0, isFriend: false });
    }

    const friend = friendsDict[message.from]

    const context = userContexts.get(userId);

    const today = new Date().toISOString().split('T')[0];

    if (context.lastGreetDate !== today) {
        context.lastGreetDate = today
        if(friend) {
            client.sendMessage(message.from, friend.greetings);
            context.friend = friend;
            context.isFriend = true;
            if(message.body.includes("gay")) {
                client.sendMessage(message.from, 'Gay el que se tragó tu papá anoche, mientras tu jefa me aplaudía.');
            }
        } else {
            client.sendMessage(message.from, 'Ha ingresado al servicio telefonico automatizado de la marina');
            client.sendMessage(message.from, 'Calamardo los robots tomaron el control de la marina !!!!');
        }
    
      
    
       
        client.sendMessage(message.from, 'Presione 1 para chismes');
        client.sendMessage(message.from, 'Presione 2 para trabajo');
        client.sendMessage(message.from, 'Presione 3 para hablar con el perro');
        client.sendMessage(message.from, 'Presione 4 para hablar con Iván');
    }


    

    const content = message.body.trim();
    if (/^\d+$/.test(content)) {
        const numberValue = parseInt(content, 10);
        context.selectedOption = numberValue
    } else {
        context.selectedOption = 0
    }

    if(context.dogCount > 0) {
        client.sendMessage(message.from, getRandomGuauString());
        context.dogCount = context.dogCount - 1;

    }

    if(context.selectedOption === 1) {
        client.sendMessage(message.from, 'Felicidades has presionado chismes!!');
        if(context.friend?.name === "Vicky") {
            client.sendMessage(message.from, 'Hola Victoria , envia 1V para chismes normales , envia 2V para chismes de mi ex');
        }
        client.sendMessage(message.from, 'Envia Chisme1 para saber sobre mi vida amorosa, Chime2 para saber de mi vida laboral, Chime3 para saber de mi :)');
    }
    if(context.selectedOption === 2) {
        client.sendMessage(message.from, 'Describa su mensaje por favor con su nombre y detalle por favor :) ');
    }
    if(context.selectedOption === 3) {
        const randomNumber = Math.floor(Math.random() * 30) + 1;
        client.sendMessage(message.from, `El siguiente perro estará disponible en  ${randomNumber} minutos`);
        context.dogCount = 5;
    }
    if(context.selectedOption === 4) {
        client.sendMessage(message.from, 'espere.... ');
    }




    context.lastMessageTime = Date.now();
   


  });

client.initialize();
