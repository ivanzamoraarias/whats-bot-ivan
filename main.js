import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { execSync } from 'child_process';
import minimist from 'minimist';




const args = minimist(process.argv.slice(2));

const clientId = args.client;

const LLAMA_DIR = 'C:\\Users\\IVAN\\Repos\\personal-llama';

const client = new Client();

const userContexts = new Map();

function isBroadcast(message) {
  // Broadcast messages usually have fromMe=true, but no author (e.g., status updates)
  if (message.fromMe && !message.author) return true;

  // You can also skip messages from status/broadcast groups
  return message.from.endsWith('@broadcast') || message.from === 'status@broadcast';
}

const getLlamaAnswer = async (message, contextMessages) => {
    const jsonString = JSON.stringify(contextMessages.slice(-6));
    const utf8Buffer = Buffer.from(jsonString, 'utf-8');
    const contextInBase64String = utf8Buffer.toString('base64');


    const output = await execSync(`npm run start -- ${clientId ? `--owner "${clientId}"`: '' } --question "${message.body}" --context "${contextInBase64String}"`, {cwd: LLAMA_DIR});
    const stringOutput = output?.toString();

    if (!stringOutput) {
        return "Lo siento, no tengo una respuesta para eso.";
    }

   
    const keyword = "Response:";

    const responseIndex = stringOutput.indexOf(keyword);

   
    const extractedResponse = stringOutput.slice(responseIndex + keyword.length).trim();
    console.log(extractedResponse); // "This is the response you want to extract."
    

    return extractedResponse;

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

    const chat = await client.getChatById(chatId);
  
  // Check if chat is archived
  if (chat.archived) {
    console.log(`[BLOCKED] Cannot send to ${chat.name} - Group is archived.`);
    return;
  }

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
   
    const output = await getLlamaAnswer(message, contextMessages);

     contextMessages.push({
        role: 'user',
        content: message.body
    });

    contextMessages.push({
        role: 'assistant',
        content: output
    });

    await client.sendMessage(message.from, `${output}`);

    /*  
    await behaviorTree.execute(message, context);
    */
});

client.initialize();