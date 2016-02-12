declare var require;
var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
// http://chimera.labs.oreilly.com/books/1230000000545/ch07.html
//
const LATENCY_2G = 650;
const LATENCY_3G = 300;
const LATENCY_4G = 90;

const LATENCIES = [LATENCY_2G, LATENCY_3G, LATENCY_4G];

const UNIVERSAL_CONFIG = {
  incomingPortPrefix: '800',
  destPort: '3000'
};

const HTTP_SERVER_CONFIG = {
  incomingPortPrefix: '808',
  destPort: '9000'
};

const SERVER_CONFIGS = [UNIVERSAL_CONFIG, HTTP_SERVER_CONFIG];

// TODO(jeffbcross): also throttle bandwidth, not just latency
LATENCIES.forEach((val, i) => {
  SERVER_CONFIGS.forEach(({incomingPortPrefix, destPort}) => {
    http.createServer(function (req, res) {
      setTimeout(() => {
        proxy.web(req, res, {target: `http://localhost:${destPort}`});
      }, val);
    }).listen(parseInt(`${incomingPortPrefix}${i}`, 10));
  });
});
