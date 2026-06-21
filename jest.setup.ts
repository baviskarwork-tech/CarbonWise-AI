import '@testing-library/jest-dom';

// Polyfill Node.js Request, Response, Headers, and fetch globals for Jest environment
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = globalThis.Request;
}
if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = globalThis.Response;
}
if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = globalThis.Headers;
}
if (typeof global.fetch === 'undefined') {
  // @ts-ignore
  global.fetch = globalThis.fetch;
}
