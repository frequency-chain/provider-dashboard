import { isLocalhost, isMainnet, createMailto } from '../../src/lib/utils';

describe('isLocalhost', () => {
  it('works', () => {
    expect(isLocalhost('http://localhost:8080')).toBe(true);
    expect(isLocalhost('wss://127.0.0.1:8080')).toBe(true);
    expect(isLocalhost('http://localhost')).toBe(true);
    expect(isLocalhost('ws://localhost:9944')).toBe(true);
    expect(isLocalhost('wss://0.rpc.frequency.xyz')).toBe(false);
    expect(isLocalhost('wss://0.rpc.testnet.amplica.io')).toBe(false);
  });
});
describe('isMainnet', () => {
  it('works', () => {
    expect(isMainnet('wss://0.rpc.frequency.xyz')).toBe(true);
    expect(isMainnet('wss://1.rpc.frequency.xyz')).toBe(true);
    expect(isMainnet('wss://0.rpc.testnet.amplica.io')).toBe(false);
    expect(isMainnet('http://localhost:8080')).toBe(false);
    expect(isMainnet('wss://127.0.0.1:8080')).toBe(false);
    expect(isMainnet('http://localhost')).toBe(false);
    expect(isMainnet('ws://localhost:9944')).toBe(false);
  });
});

describe('createMailto', () => {
  type TestCase = {
    to: string;
    subject: string | undefined;
    body: string | undefined;
    expectedOutput: string;
    expectedErr: boolean;
  };
  const testCases: Array<TestCase> = [
    {
      to: 'foo@bar',
      subject: 'hello',
      body: 'testing one two three',
      expectedOutput: 'to is not an email address: foo@bar',
      expectedErr: true,
    },
    {
      to: 'foo@bar.com',
      subject: 'hello',
      body: 'testing one two three',
      expectedOutput: 'mailto:foo@bar.com?subject=hello&body=testing%20one%20two%20three',
      expectedErr: false,
    },
    {
      to: 'nowhere@mozilla.org',
      subject: 'This is the subject',
      body: 'This is the body',
      expectedOutput: 'mailto:nowhere@mozilla.org?subject=This%20is%20the%20subject&body=This%20is%20the%20body',
      expectedErr: false,
    },
  ];
  testCases.forEach((tc) => {
    it(`${tc.body}: result = ${tc.expectedOutput}`, () => {
      if (tc.expectedErr) {
        expect(() => createMailto(tc.to, tc.subject, tc.body)).toThrow(tc.expectedOutput);
      } else {
        expect(createMailto(tc.to, tc.subject, tc.body)).toEqual(tc.expectedOutput);
      }
    });
  });
});
