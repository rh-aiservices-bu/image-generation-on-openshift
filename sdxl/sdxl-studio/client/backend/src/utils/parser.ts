interface Message {
  content: string;
}

interface Choice {
  message: Message;
}

interface Data {
  choices: Choice[];
}

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
