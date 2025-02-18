import axios from 'axios';
import { Payload } from '../schema/payload';
import {
    getGuardEndpoint,
    getGuardModel,
    getGuardTemp,
    getGuardPromptPreFix,
  } from '../utils/config';
import { parseGuardResponse } from '../utils/parser';

export default async (payload: Payload): Promise<boolean> => {
    const message = {
      model: getGuardModel(),
      messages: [{ role: 'user', content: getGuardPromptPreFix() + ' ' + payload.prompt }],
      temperature: getGuardTemp(),
    };
    console.log(
      'Sending request to Guard endpoint:',
      getGuardEndpoint().guardEndpointURL + `/chat/completions`,
    );
    const guardResponse = await axios.post(
      getGuardEndpoint().guardEndpointURL + `/chat/completions`,
      message,
    );
    if (parseGuardResponse(guardResponse.data) !== 'No') {
      return false // Prompt failed guard check
    } else {
      return true // Prompt passed guard check
    }
};