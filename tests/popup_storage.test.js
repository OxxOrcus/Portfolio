const test = require('node:test');
const assert = require('node:assert');

// Mock DOM environment for js/script.js to load
global.document = {
  createDocumentFragment: () => ({ appendChild: () => {} }),
  createElement: () => ({
    style: {},
    appendChild: () => {},
    animate: () => {},
    remove: () => {},
    addEventListener: () => {}
  }),
  body: { appendChild: () => {} },
  querySelector: () => null,
  querySelectorAll: () => ({ forEach: () => {} }),
  head: { appendChild: () => {} },
  addEventListener: () => {},
  getElementById: () => null
};
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {}
};
global.DOMParser = class {
  parseFromString() {
    return { documentElement: {} };
  }
};
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { hasSeenPopup, markPopupSeen } = require('../js/script.js');

test('hasSeenPopup returns true if sessionStorage has newsletterSeen="1"', (t) => {
  const originalSessionStorage = global.sessionStorage;
  global.sessionStorage = {
    getItem: (key) => {
      if (key === 'newsletterSeen') return '1';
      return null;
    }
  };

  try {
    assert.strictEqual(hasSeenPopup(), true);
  } finally {
    global.sessionStorage = originalSessionStorage;
  }
});

test('hasSeenPopup returns false if sessionStorage does not have newsletterSeen="1"', (t) => {
  const originalSessionStorage = global.sessionStorage;
  global.sessionStorage = {
    getItem: (key) => null
  };

  try {
    assert.strictEqual(hasSeenPopup(), false);
  } finally {
    global.sessionStorage = originalSessionStorage;
  }
});

test('hasSeenPopup returns false if sessionStorage.getItem throws', (t) => {
  const originalSessionStorage = global.sessionStorage;
  global.sessionStorage = {
    getItem: () => { throw new Error('Storage disabled'); }
  };

  try {
    assert.strictEqual(hasSeenPopup(), false);
  } finally {
    global.sessionStorage = originalSessionStorage;
  }
});

test('markPopupSeen sets newsletterSeen="1" in sessionStorage', (t) => {
  const originalSessionStorage = global.sessionStorage;
  let storedKey = null;
  let storedValue = null;
  global.sessionStorage = {
    setItem: (key, value) => {
      storedKey = key;
      storedValue = value;
    }
  };

  try {
    markPopupSeen();
    assert.strictEqual(storedKey, 'newsletterSeen');
    assert.strictEqual(storedValue, '1');
  } finally {
    global.sessionStorage = originalSessionStorage;
  }
});

test('markPopupSeen handles errors if sessionStorage.setItem throws', (t) => {
  const originalSessionStorage = global.sessionStorage;
  global.sessionStorage = {
    setItem: () => { throw new Error('Storage full'); }
  };

  try {
    // Should not throw
    markPopupSeen();
    assert.ok(true);
  } finally {
    global.sessionStorage = originalSessionStorage;
  }
});
