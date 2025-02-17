import {getParasolMode, getSDXLEndpoint, setSDXLEndpoint, getGuardEndpoint, setGuardEndpoint, getGuardEnabled}  from '../utils/config';

test('getParasolMode: default, false ', () => {
  
  expect(getParasolMode()).toBe("false");
});

test('getSDXLEndpoint: ', () => {
  setSDXLEndpoint('http://sdxl.url.endpoint/', 'sdxl-token')

  expect(getSDXLEndpoint()).toMatchObject({"sdxlEndpointToken": "sdxl-token", "sdxlEndpointURL": "http://sdxl.url.endpoint"});
});

test('getGuardEndpoint: ', () => {
  setGuardEndpoint('http://guard.url.endpoint/', 'guard-token')

  expect(getGuardEndpoint()).toMatchObject({"guardEndpointToken": "guard-token", "guardEndpointURL": "http://guard.url.endpoint"});
});

test('getGuardEnabled: default, false ', () => {
  
  expect(getGuardEnabled()).toBe("false");
});


