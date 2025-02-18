import axios from 'axios';
import guardFunction from '../../services/guard' // Update with the actual path
import { getGuardConfig } from '../../utils/config';
import { parseGuardResponse } from '../../utils/parser';
import { Payload } from '../../schema/payload';

jest.mock('axios');
jest.mock('../../utils/config');
jest.mock('../../utils/parser');
const mockedAxios = axios as jest.Mocked<typeof axios>;



describe('Guard Function', () => {
    let mockPayload: Payload;
    let mockConfig;

    beforeEach(() => {
        mockPayload = { 
            prompt: 'Test prompt',         
            guidance_scale: 7.5,
            num_inference_steps: 50,
            crops_coords_top_left: [0,0],
            width: 512,
            height: 512, 
<<<<<<< HEAD
            denoising_limit: 0,
            past_threshold: false,
            image_failed_check: false
        };
=======
            denoising_limit: 0};
>>>>>>> e584030 (Added tests for guard module)
            
        mockConfig = {
            guardModel: 'test-model',
            guardPromptPreFix: 'Prefix',
            guardTemp: 0.7,
            guardEndpointURL: 'https://test-url.com',
            guardEndpointToken: 'test-token',
        };
        (getGuardConfig as jest.Mock).mockReturnValue(mockConfig);
   
    });

<<<<<<< HEAD
    it('should return true when guard response is not "No"', async () => {
=======
    it('should return false when guard response is not "No"', async () => {
>>>>>>> e584030 (Added tests for guard module)

        mockedAxios.post.mockResolvedValue({ data: { response: 'Yes' } });
        (parseGuardResponse as jest.Mock).mockReturnValue('Yes');
  

        const result = await guardFunction(mockPayload);
<<<<<<< HEAD
        expect(result).toBe(true);
=======
        expect(result).toBe(false);
>>>>>>> e584030 (Added tests for guard module)
        expect(axios.post).toHaveBeenCalledWith(
            'https://test-url.com/chat/completions',
            {
                model: 'test-model',
                messages: [{ role: 'user', content: 'Prefix Test prompt' }],
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: 'Bearer test-token',
                    'Content-Type': 'application/json',
                },
            }
        );
    });

<<<<<<< HEAD
    it('should return false when guard response is "No"', async () => {
=======
    it('should return true when guard response is "No"', async () => {
>>>>>>> e584030 (Added tests for guard module)
        mockedAxios.post.mockResolvedValue({ data: { response: 'No' } });
        (parseGuardResponse as jest.Mock).mockReturnValue('No');

        const result = await guardFunction(mockPayload);
<<<<<<< HEAD
        expect(result).toBe(false);
    });
});
=======
        expect(result).toBe(true);
    });
});
>>>>>>> e584030 (Added tests for guard module)
