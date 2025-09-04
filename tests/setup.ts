import '@testing-library/jest-dom';


Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    marginTop: '0px',
    marginBottom: '0px',
    paddingTop: '0px',
    paddingBottom: '0px',
    borderWidth: '0px',
    fontSize: '16px'
  })
});


Object.defineProperty(window, 'screen', {
  value: {
    deviceXDPI: 96,
    deviceYDPI: 96
  }
});


global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};


global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};


jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123'
}));


jest.mock('zeed-dom', () => ({
  createHTMLDocument: () => ({
    createElement: () => ({
      innerHTML: '',
      appendChild: () => {},
      setAttribute: () => {},
      classList: { add: () => {} }
    }),
    body: {
      appendChild: () => {},
      classList: { add: () => {} }
    },
    head: {
      appendChild: () => {}
    },
    querySelector: () => null,
    getElementById: () => null
  })
}));


jest.mock('mitt', () => () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));
