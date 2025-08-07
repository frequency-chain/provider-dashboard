/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;

  readyState = 1;
  binaryType = '';
  bufferedAmount = 0;
  extensions = '';
  protocol = '';
  url = '';
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
  send = vi.fn();
  close = vi.fn();

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = url.toString();
  }
}

// Must be set before anything uses WebSocket
globalThis.WebSocket = MockWebSocket as any;

// Mock Element.animate for JSDOM (since it's not implemented)
if (!HTMLElement.prototype.animate) {
  HTMLElement.prototype.animate = function (): Animation {
    return {
      finished: Promise.resolve(),
      cancel: () => {},
      play: () => {},
      pause: () => {},
      reverse: () => {},
      finish: () => {},
      onfinish: null,
      oncancel: null,
      startTime: null,
      currentTime: null,
      playbackRate: 1,
      playState: 'finished',
      replaceState: 'active',
      effect: null,
      timeline: null,
      id: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as Animation;
  };
}
