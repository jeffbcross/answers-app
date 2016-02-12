var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
// http://chimera.labs.oreilly.com/books/1230000000545/ch07.html
//
const LATENCY_2G = 650;
const LATENCY_3G = 300;
const LATENCY_4G = 90;

[LATENCY_2G, LATENCY_3G, LATENCY_4G].forEach((val, i) => {
  http.createServer(function (req, res) {
    setTimeout(() => {
      proxy.web(req, res, {target: 'http://localhost:3000'});
    }, val);

  }).listen(parseInt(`800${i}`, 10));
})
