import axios from 'axios';
import imageSafetyCheck from '../../services/image-safety-check'; // Update with the correct path
import { getSafetyCheckConfig } from '../../utils/config';

jest.mock('axios');
jest.mock('../../utils/config', () => ({
  getSafetyCheckConfig: jest.fn(),
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('imageSafetyCheck', () => {
  it('should return the safety check response when successful', async () => {
    (getSafetyCheckConfig as jest.Mock).mockReturnValue({
        safetyCheckEndpointURL: 'https://mockapi.com',
        safetyCheckModel: 'mockModel',
        safetyCheckEndpointToken: 'mockToken',
      });


    const mockResponse = {
      data: {
        outputs: [{ data: [false] }],
      },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await imageSafetyCheck('mockImageString');
    expect(result).toBe(false);
    expect(axios.post).toHaveBeenCalledWith(
      'https://mockapi.com/v2/models/mockModel/infer',
      {
        inputs: [
          {
            name: 'image',
            shape: [1, 1],
            datatype: 'String',
            data: ['mockImageString'],
          },
        ],
      },
      {
        headers: {
          Authorization: 'Bearer mockToken',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should return true when response is missing expected data', async () => {
      (getSafetyCheckConfig as jest.Mock).mockReturnValue({
      safetyCheckEndpointURL: 'https://mockapi.com',
      safetyCheckModel: 'mockModel',
      safetyCheckEndpointToken: 'mockToken',
    });

    mockedAxios.post.mockResolvedValue({ data: {} });

    const result = await imageSafetyCheck('mockImageString');
    expect(result).toBe(true);
  });
});