// Initial configuration
let sdxlEndpointURL = process.env.SDXL_ENDPOINT_URL || '';
let sdxlEndpointToken = process.env.SDXL_ENDPOINT_TOKEN || '';
let guardEndpointURL = process.env.GUARD_ENDPOINT_URL || '';
let guardEndpointToken = process.env.GUARD_ENDPOINT_TOKEN || '';
const parasolMode = process.env.PARASOL_MODE || 'false';
let guardEnabled = process.env.GUARD_ENABLED || 'false';
const guardModel = process.env.GUARD_MODEL || 'granite3-guardian-2b';
const guardTemp = process.env.GUARD_TEMP || '0.7';

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

export const getGuardEndpoint = (): any => {
  return {
    guardEndpointURL: guardEndpointURL.replace(/\/$/, ''),
    guardEndpointToken,
  };
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

export const getGuardModel = (): string => {
  return guardModel;
};

export const getGuardTemp = (): string => {
  return guardTemp;
};
