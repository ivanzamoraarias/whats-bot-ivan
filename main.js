import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { execSync } from 'child_process';
import minimist from 'minimist';




const args = minimist(process.argv.slice(2));

const clientId = args.client;

const LLAMA_DIR = 'C:\\Users\\IVAN\\Repos\\personal-llama';

const client = new Client();

const userContexts = new Map();


function sleepRandom() {
    const delay = Math.floor(Math.random() * (300000 - 1000 + 1)) + 1000;
    
    console.log(` Will respond in ${delay/1000} seconds.`);
    return new Promise(resolve => setTimeout(resolve, delay));
}

function isBroadcast(message) {
  // Broadcast messages usually have fromMe=true, but no author (e.g., status updates)
  if (message.fromMe && !message.author) return true;

  // You can also skip messages from status/broadcast groups
  return message.from.endsWith('@broadcast') || message.from === 'status@broadcast';
}

const getLlamaAnswer = async (message, userId) => {
    try {

        const output = await execSync(`npm run start -- ${clientId ? `--owner "${clientId}"`: '' } --question "${message.body}" --conversationId "${userId}"`, {cwd: LLAMA_DIR});
        const stringOutput = output?.toString();

        if (!stringOutput) {
            return "Lo siento, no tengo una respuesta para eso.";
        }

   
        const keyword = "Response:";

        const responseIndex = stringOutput.indexOf(keyword);

   
        const extractedResponse = stringOutput.slice(responseIndex + keyword.length).trim();
        console.log(extractedResponse); // "This is the response you want to extract."
    

        return extractedResponse;

    } catch (error) {
        return "cant answer that right now, try again later.";
    }

}

/* 
// Initialize behavior tree
const behaviorTree = new BehaviorTree();

*/

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async (message) => {

    

    if (isBroadcast(message)) {
        return;
    }

   

    console.log(`Mensaje recibido de ${message.pushname} :::: ${message.from}: ${message.body}`);

    const userId = message.from;

    // Initialize context if user is new
    if (!userContexts.has(userId)) {
        userContexts.set(userId, { 
            lastMessageTime: Date.now(), 
            lastGreetDate: null, 
            selectedOption: 0, 
            isFriend: false,
            dogCount: 0,
            contextMessages: []
        });
    }


    const context = userContexts.get(userId);


     if(message.hasMedia) {
        
    }


    const contextMessages = context.contextMessages || [];
   
    const output = await getLlamaAnswer(message, userId);

     contextMessages.push({
        role: 'user',
        content: message.body
    });

    contextMessages.push({
        role: 'assistant',
        content: output
    });

    await sleepRandom();

    await client.sendMessage(message.from, `${output}`);

    /*  
    await behaviorTree.execute(message, context);
    */
});

client.initialize();