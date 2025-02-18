interface Message {
    content: string;
  }
  
  interface Choice {
    message: Message;
  }
  
 export interface Data {
    choices: Choice[];
  }
