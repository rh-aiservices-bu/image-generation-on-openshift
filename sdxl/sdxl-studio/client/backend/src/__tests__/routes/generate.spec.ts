import Fastify from 'fastify';
import axios from 'axios';
import guard from '../../services/guard';
import jobRoutes from '../../routes/api/generate/index'
import {setSDXLEndpoint, setGuardEndpoint, setGuardEnabled, getGuardEnabled} from '../../utils/config';

jest.mock('axios');
jest.mock('ws');
jest.mock('../../services/guard');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const fastify = Fastify();

beforeAll(async () => {
  await fastify.register(jobRoutes);
  await fastify.listen({ port: 3000 });
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /', () => {
  it('should return job_id when generation request is successful with guardian disabled', async () => {
    setGuardEnabled('false');
    setSDXLEndpoint('http://sdxl-endpoint', 'sdxl-token');
    mockedAxios.post.mockImplementation((url, data) => {
      if (url === 'http://sdxl-endpoint/generate?user_key=sdxl-token') {
        return Promise.resolve({ data: { job_id: '12345' } });
      } else {
        return Promise.reject(new Error('Invalid request'));
      }
    });
    
    const response = await fastify.inject({
      method: 'POST',
      url: '/',
      payload: {
        prompt: 'test',
        guidance_scale: 7.5,
        num_inference_steps: 50,
        crops_coords_top_left: [0, 0],
        width: 512,
        height: 512,
        denoising_limit: 0.5,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ job_id: '12345' });
  });

  it('should reject a request if guard check fails', async () => {
    setGuardEnabled('true');
    (guard as jest.Mock).mockResolvedValue(true);

    const response = await fastify.inject({
      method: 'POST',
      url: '/',
      payload: {
        prompt: 'inappropriate content',
      },
    });


    expect(response.body).toEqual("{\"message\":\"Your query appears to contain inappropriate content. Please rephrase and try again\"}");

  });

  it('should return error code 200 when guardian is enabled and prompt request is for safe content', async () => {
    setGuardEnabled('true');
    (guard as jest.Mock).mockResolvedValue(false);
    mockedAxios.post.mockImplementation((url, data) => {
      if (url === 'http://sdxl-endpoint/generate?user_key=sdxl-token') {
        return Promise.resolve({ data: { job_id: '98765' } });
      } else {
        return Promise.reject(new Error('Invalid request'));
      }
    });
    const response = await fastify.inject({
      method: 'POST',
      url: '/',
      payload: {
        prompt: 'safe request',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ job_id: '98765' });
  });


});