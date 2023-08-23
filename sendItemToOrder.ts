import { createAMQPConnection } from "./rabbit_connection";

async function sendMessageToQueue(queueName:string, message:any) {
    try {
      const connection = await createAMQPConnection();
      const channel = await connection.createChannel();
  
      await channel.assertQueue(queueName);
      await channel.sendToQueue(queueName, Buffer.from(message));
  
      console.log('Message sent to queue successfully.');
  
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

export {sendMessageToQueue};