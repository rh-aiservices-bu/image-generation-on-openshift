import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import WebSocket from 'ws';
import { getSDXLEndpoint, getGuardEnabled } from '../../../utils/config'; // Adjust the import path as needed
import guard from '../../../services/guard';
export default async (fastify: FastifyInstance): Promise<void> => {
  const decoder = new TextDecoder('utf-8');

  // ============================
  // 1. POST Endpoint: Start Job
  // ============================
  fastify.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const {
      prompt,
      guidance_scale,
      num_inference_steps,
      crops_coords_top_left,
      width,
      height,
      denoising_limit,
    } = req.body as any;

    const data = {
      prompt,
      guidance_scale,
      num_inference_steps,
      crops_coords_top_left,
      width,
      height,
      denoising_limit,
    };

    if (getGuardEnabled() === 'true') {
      const failedGuardCheck = await guard(data);
      if (failedGuardCheck) {
        reply.code(403).send({
          message:
            'Your query appears to contain inappropriate content. Please rephrase and try again',
        });
        return;
      }
    }

    console.log(
      'Sending request to SDXL endpoint:',
      getSDXLEndpoint().sdxlEndpointURL + '/generate',
    );

    const response = await axios.post(
      getSDXLEndpoint().sdxlEndpointURL +
        `/generate?user_key=${getSDXLEndpoint().sdxlEndpointToken}`,
      data,
    );

    const { job_id } = response.data;
    if (!job_id) {
      reply.code(500).send({ message: 'No job_id returned from generation endpoint.' });
      return;
    }

    reply.send({ job_id });
  });

  // =======================================================
  // 2. WebSocket Endpoint: Pipe API updates to the Client
  // =======================================================
  fastify.get('/progress/:job_id', { websocket: true }, (connection, req) => {
    const { job_id } = req.params as { job_id: string };
    console.log(`Client connected for job_id: ${job_id}`);

    // Connect to the external API WebSocket
    const wsProtocol = getSDXLEndpoint().sdxlEndpointURL.startsWith('https') ? 'wss' : 'ws';
    const backendHost = getSDXLEndpoint().sdxlEndpointURL.replace(/^https?:\/\//, '');

    const apiWsUrl = `${wsProtocol}://${backendHost}/progress/${job_id}?user_key=${
      getSDXLEndpoint().sdxlEndpointToken
    }`;
    console.log(`Connecting to API WebSocket: ${apiWsUrl}`);
    const apiWs = new WebSocket(apiWsUrl);

    // Handle incoming messages from the API WebSocket
    apiWs.on('message', (data: WebSocket.Data) => {
      try {
        const dataString = typeof data === 'string' ? data : decoder.decode(data as ArrayBuffer);
        const msg = JSON.parse(dataString);
        // console.log('job_id:', job_id, 'Received message from API:', msg.status);
        msg.job_id = job_id;

        // Forward the message to the client
        connection.socket.send(JSON.stringify(msg));

        // Close both connections when the job is complete
        if (msg.status === 'completed') {
          apiWs.close();
          connection.socket.close();
        }
      } catch (err) {
        console.error('Error parsing message from API:', err);
      }
    });

    // Handle API WebSocket errors
    apiWs.on('error', (error) => {
      console.error('API WebSocket error:', error);
      connection.socket.send(JSON.stringify({ error: 'Error receiving job updates.' }));
      connection.socket.close();
    });

    // When API WebSocket closes, close the client WebSocket
    apiWs.on('close', () => {
      console.log(`API WebSocket closed for job_id: ${job_id}`);
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.close();
      }
    });

    // Handle client messages (optional)
    connection.socket.on('message', (data) => {
      const dataString = typeof data === 'string' ? data : decoder.decode(data as ArrayBuffer);
      console.log('Received message from client:', dataString);
    });

    // When the client disconnects, close the API WebSocket if open
    connection.socket.on('close', () => {
      console.log(`Client WebSocket closed for job_id: ${job_id}`);
      if (apiWs.readyState === WebSocket.OPEN) {
        apiWs.close();
      }
    });
  });
};
