import {getParasolMode, getSDXLEndpoint, setSDXLEndpoint,  setGuardEndpoint, getGuardConfig, getGuardEnabled}  from '../utils/config';

test('getParasolMode: default, false ', () => {
  
  expect(getParasolMode()).toBe("false");
});

test('getSDXLEndpoint: ', () => {
  setSDXLEndpoint('http://sdxl.url.endpoint/', 'sdxl-token')

  expect(getSDXLEndpoint()).toMatchObject({"sdxlEndpointToken": "sdxl-token", "sdxlEndpointURL": "http://sdxl.url.endpoint"});
});

test('SetGuardEndpoint: ', () => {
  setGuardEndpoint('http://guard.url.endpoint/', 'guard-token')
  const guardConfig = getGuardConfig();
  expect(guardConfig.guardEndpointURL).toMatch( "http://guard.url.endpoint");
  expect(guardConfig.guardEndpointToken).toMatch( "guard-token");
});

test('getGuardEnabled: default, false ', () => {
  
  expect(getGuardEnabled()).toBe("false");
});
