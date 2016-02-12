var httpServer = require('http-server');

exports.config = {
  directConnect: true,

  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      //Important for benchpress to get timeline data from the browser
      'args': ['--js-flags=--expose-gc'],
      'perfLoggingPrefs': {
        'traceCategories': 'v8,blink.console,devtools.timeline'
      }
    },
    loggingPrefs: {
      performance: 'ALL'
    }
  },

  specs: [
    'test/perf/load/page-load.spec.js'
  ],
  framework: 'jasmine2',

  beforeLaunch: function () {
    require('./dist/app/main-server');
    require('./test/proxy-server');
    httpServer.createServer({
      showDir: false,
      root: 'dist'
    }).listen('8080', 'localhost');
  },
  onPrepare: function() {
    // open a new browser for every benchmark
    var originalBrowser = browser;
    beforeEach(function() {
      global.browser = originalBrowser.forkNewDriverInstance();
      global.browser.ignoreSynchronization = true;
      global.element = global.browser.element;
      global.$ = global.browser.$;
      global.$$ = global.browser.$$;
    });

    afterEach(function() {
      global.browser.quit();
      global.browser = originalBrowser;
    });
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
};