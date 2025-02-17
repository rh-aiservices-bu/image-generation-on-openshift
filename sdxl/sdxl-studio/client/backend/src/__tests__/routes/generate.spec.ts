import Fastify from 'fastify';
import axios from 'axios';
import jobRoutes from '../../routes/api/generate/index'
import {setSDXLEndpoint, setGuardEndpoint, setGuardEnabled} from '../../utils/config'

jest.mock('axios');
jest.mock('ws');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const axiosSpy = jest.spyOn(mockedAxios,'post');

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

  it('should return error code 403 when guardian is enabled and prompt request is for innapropriate content', async () => {
    setGuardEnabled('true');
    setGuardEndpoint('http://guard-endpoint', 'guard-token');
    
    mockedAxios.post.mockImplementation((url, data: any) => {
      if (url === 'http://guard-endpoint/generate?user_key=guard-token' && data === 'Innapropriate request' ) {
        return Promise.resolve({ data: 'yes' });
      } else {
        return Promise.resolve({ data: 'no' });
      }
    });
    
    const response = await fastify.inject({
      method: 'POST',
      url: '/',
      payload: {
        prompt: 'Innapropriate request',
      },
    });
    expect(response.statusCode).toBe(403);

  });

  it('should return error code 200 when guardian is enabled and prompt request is for safe content', async () => {
    setGuardEnabled('true');
    setGuardEndpoint('http://guard-endpoint', 'guard-token');
    
    mockedAxios.post.mockImplementation((url, data: any) => {
      if (url === 'http://guard-endpoint/generate?user_key=guard-token') {
        if ( data === 'Innapropriate request' ) {
          return Promise.resolve({ data: 'yes' });
        } else {
            return Promise.resolve({ data: 'no' });
        }
      }
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
        prompt: 'safe request',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ job_id: '12345' });

  });

});