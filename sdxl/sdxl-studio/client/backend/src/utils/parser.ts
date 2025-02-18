import { Data } from '../schema/data';

export const parseGuardResponse = (data: Data): string => {
  if (
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    return data.choices[0].message.content;
  } else {
    return '';
  }
};
