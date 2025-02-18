import axios from 'axios';
import {
    getSafetyCheckConfig
  } from '../utils/config';


export default async (image: String): Promise<boolean> => {

  const safetyCheckConfig = getSafetyCheckConfig();
  const json_data = {
      inputs: [{
        name: 'image',
        shape: [1,1],
        datatype: 'String',
        data: [image]
      }]
    };
    const endpoint = safetyCheckConfig.safetyCheckEndpointURL + `/v2/models/` + safetyCheckConfig.safetyCheckModel + `/infer`;
    console.log(
      'Sending request to Image Safety Check endpoint:',
      endpoint,
    );
    const headers = {
      Authorization: `Bearer ${safetyCheckConfig.safetyCheckEndpointToken}`, // Include Bearer Token
      'Content-Type': 'application/json', // Ensure correct content type
    }
    const safetyCheckResponse = await axios.post(
      endpoint,
        json_data,
        {
          headers
        }
      );
    if (safetyCheckResponse.data && 
      safetyCheckResponse.data.outputs  ) {
      return safetyCheckResponse.data.outputs[0].data[0];
    } else {
      return true;
     }

};