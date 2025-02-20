export interface GuardConfig {
    guardModel: string;
    guardTemp: string;
    guardPromptPreFix: string;
    guardEndpointURL: string;
    guardEndpointToken: string;
  }

export interface SafetyCheckConfig {
    safetyCheckModel: string;
    safetyCheckEndpointURL: string;
    safetyCheckEndpointToken: string;
  }
  