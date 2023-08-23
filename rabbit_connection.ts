import * as amqp from 'amqplib';
async function createAMQPConnection() {
    try {
      const connection = await amqp.connect('amqp://localhost:5672'); // Replace with your RabbitMQ server URL
      return connection;
    } catch (error) {
      console.error('Error occurred while establishing AMQP connection:', error);
      throw error;
    }
  }

export {createAMQPConnection};