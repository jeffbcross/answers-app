require('reflect-metadata');
var benchpress = require('benchpress');
var runner = new benchpress.Runner([
  //use protractor as Webdriver client
  benchpress.SeleniumWebDriverAdapter.PROTRACTOR_BINDINGS,
  //use RegressionSlopeValidator to validate samples
  benchpress.Validator.bindTo(benchpress.RegressionSlopeValidator),
  //use 10 samples to calculate slope regression
  benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(50),
  //use the script metric to calculate slope regression
  benchpress.bind(benchpress.RegressionSlopeValidator.METRIC).toValue('scriptTime'),
  benchpress.MultiMetric.createBindings([benchpress.UserMetric]),
  benchpress.UserMetric.createBindings({
    loadTime: 'The time in milliseconds to bootstrap'
  }),
  benchpress.bind(benchpress.Options.FORCE_GC).toValue(true)
]);

const SAMPLE_SIZE = 20;
const REPORT_LINE = '|----------------------------------';
const JASMINE_TIMEOUT = 60 * 1000;

var validator = new benchpress.RegressionSlopeValidator(SAMPLE_SIZE, 'loadTime');

describe('home page load', function() {
  ['2G', '3G', '4G'].forEach((speed, i) => {
    [{
      server: 'universal',
      portPrefix: '800',
      path: ''
    },{
      server: 'http-server',
      portPrefix: '808',
      path: 'index.ng2.html'
    }].forEach((config) => {
      it(`should be fast with ${config.server} on ${speed} connection`, function(done) {
        writeTestStart(`TESTING ${config.server.toUpperCase()} on ${speed}`);
        var samples = [];
        var finalSample;

        runner.sample({
          execute: () => {
            browser.get(`http://localhost:${config.portPrefix}${i}/${config.path}`);
            // browser.wait($('.new-question'));
          }
        });

        // function loadPage() {
        //   var startTime = process.hrtime();
        //   browser.get(`http://localhost:${config.portPrefix}${i}/${config.path}`);
        //   browser.wait($('.new-question').getText().then(() => {
        //     var totalTime = process.hrtime(startTime);
        //     samples.push({
        //       values: {
        //         loadTime: parseFloat(totalTime.join('.'))
        //       }
        //     });
        //     if (finalSample = validator.validate(samples)) {
        //       var mean = finalSample
        //             .map(v => v.values.loadTime)
        //             .reduce((prev, current, i) => prev + current, 0) / SAMPLE_SIZE;
        //       var stddev = calculateCoefficientOfVariation(finalSample.map(v => v.values.loadTime), mean);
        //       writeReport(
        //           `LOAD TIMES FOR ${speed} ON ${config.server.toUpperCase()}`,
        //           finalSample.map(v => v.values.loadTime),
        //           `MEAN ${mean} ± ${stddev}%`
        //           );
        //       done();
        //     } else {
        //       loadPage();
        //     }
        //   }));
        // }
        // loadPage();
      }, JASMINE_TIMEOUT);
    });
  });
});

function writeTestStart (heading) {
  console.log('');
  console.log(REPORT_LINE);
  console.log(`|- ${heading}`)
  console.log(REPORT_LINE);
  console.log('');
}

function writeReport (heading, rows, footer) {
  console.log('');
  console.log(REPORT_LINE)
  console.log(`|- ${heading}`);
  console.log(REPORT_LINE);
  rows.forEach((v) => console.log('|-', v));
  console.log(`|- ${footer}`);
  console.log(REPORT_LINE);
  console.log('');
}

function calculateCoefficientOfVariation(sample, mean) {
  return calculateStandardDeviation(sample, mean) / mean * 100;
}

function calculateMean(samples) {
  var total = 0;
  // TODO: use reduce
  samples.forEach(x => total += x);
  return total / samples.length;
}

function calculateStandardDeviation(samples, mean) {
  var deviation = 0;
  // TODO: use reduce
  samples.forEach(x => deviation += Math.pow(x - mean, 2));
  deviation = deviation / (samples.length);
  deviation = Math.sqrt(deviation);
  return deviation;
}