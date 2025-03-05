// Initial configuration
let sdxlEndpointURL = process.env.SDXL_ENDPOINT_URL || '';
let sdxlEndpointToken = process.env.SDXL_ENDPOINT_TOKEN || '';
let guardEndpointURL = process.env.GUARD_ENDPOINT_URL || '';
let guardEndpointToken = process.env.GUARD_ENDPOINT_TOKEN || '';
const parasolMode = process.env.PARASOL_MODE || 'false';
let guardEnabled = process.env.GUARD_ENABLED || 'true';
const guardModel = process.env.GUARD_MODEL || 'granite3-guardian-2b';
const guardTemp = process.env.GUARD_TEMP || '0.7';
const guardPromptPreFix = process.env.GUARD_PROMPT_PREFIX || 'Draw a picture of';
let safetyCheckEnabled = process.env.SAFETY_CHECK_ENABLED || 'true';
const safetyCheckEndpointURL = process.env.SAFETY_CHECK_ENDPOINT_URL || '';
const safetyCheckEndpointToken = process.env.SAFETY_CHECK_ENDPOINT_TOKEN || '';
const safetyCheckModel = process.env.SAFETY_CHECK_MODEL || 'safety-checker';

import { GuardConfig, SafetyCheckConfig } from '../schema/config';

export const getSDXLEndpoint = (): any => {
  return {
    sdxlEndpointURL: sdxlEndpointURL.replace(/\/$/, ''),
    sdxlEndpointToken,
  };
};

export const setGuardEndpoint = (url: string, token: string): void => {
  guardEndpointURL = url;
  guardEndpointToken = token;
};

export const setSDXLEndpoint = (url: string, token: string): void => {
  sdxlEndpointURL = url;
  sdxlEndpointToken = token;
};

export const getParasolMode = (): string => {
  return parasolMode;
};

export const getGuardEnabled = (): string => {
  return guardEnabled;
};

export const setGuardEnabled = (enabled: string): void => {
  guardEnabled = enabled;
};

export const getGuardConfig = (): GuardConfig => {
  return {
    guardModel,
    guardTemp,
    guardEndpointToken,
    guardEndpointURL,
    guardPromptPreFix,
  };
};

export const getSafetyCheckEnabled = (): string => {
  return safetyCheckEnabled;
};

export const setSafetyCheckEnabled = (enabled: string): void => {
  safetyCheckEnabled = enabled;
};

export const getSafetyCheckConfig = (): SafetyCheckConfig => {
  return {
    safetyCheckModel,
    safetyCheckEndpointToken,
    safetyCheckEndpointURL,
  };
};
