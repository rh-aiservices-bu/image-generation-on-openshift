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
    const guardResponse = await axios.post(
      guardConfig.guardEndpointURL+ `/chat/completions`,
      message,
    );
    console.log(guardResponse);
    if (parseGuardResponse(guardResponse.data) !== 'No') {
      return false // Prompt failed guard check
    } else {
      return true // Prompt passed guard check 
    }
};