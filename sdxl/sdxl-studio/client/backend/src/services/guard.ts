import axios from 'axios';
import { Payload } from '../schema/payload';
import {
    getGuardConfig
  } from '../utils/config';
import { parseGuardResponse } from '../utils/parser';

export default async (payload: Payload): Promise<boolean> => {
    const guardConfig = getGuardConfig();
    const message = {
      model: guardConfig.guardModel,
      messages: [{ role: 'user', content: guardConfig.guardPromptPreFix + ' ' + payload.prompt }],
      temperature: guardConfig.guardTemp,
    };
    console.log(
      'Sending request to Guard endpoint:',
      guardConfig.guardEndpointURL + `/chat/completions`,
    );
    const headers = {
      Authorization: `Bearer ${guardConfig.guardEndpointToken}`, // Include Bearer Token
      'Content-Type': 'application/json', // Ensure correct content type
    }
    const guardResponse = await axios.post(
        guardConfig.guardEndpointURL + `/chat/completions`,
        message,
        {
          headers
        }
      );

    if (parseGuardResponse(guardResponse.data) !== 'No') {
      return true // Prompt failed guard check
    } else {
      return false // Prompt passed guard check 
    }
};