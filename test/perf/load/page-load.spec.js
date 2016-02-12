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
  benchpress.bind(benchpress.Options.FORCE_GC).toValue(true)
]);

const SAMPLE_SIZE = 5;

describe('home page load', function() {
  ['2G', '3G', '4G'].forEach((speed, i) => {
    it(`should be fast with universal on ${speed} connection`, function(done) {
      var validator = new benchpress.RegressionSlopeValidator(SAMPLE_SIZE, 'loadTime');
      var samples = [];
      var finalSample;

      function loadPage() {
        var startTime = process.hrtime();
        browser.get(`http://localhost:800${i}`);
        browser.wait($('.new-question').getText().then(() => {
          var totalTime = process.hrtime(startTime);
          samples.push({
            values: {
              loadTime: parseFloat(totalTime.join('.'))
            }
          });
          if (finalSample = validator.validate(samples)) {
            writeReport(
                `LOAD TIMES FOR ${speed}`,
                finalSample.map(v => v.values.loadTime),
                'MEAN ' + finalSample
                  .map(v => v.values.loadTime)
                  .reduce((prev, current, i) => prev + current, 0) / SAMPLE_SIZE
                );
            done();
          } else {
            loadPage();
          }
        }));
      }
      loadPage();
    });
  });


  xit('should be fast with http-server', function(done) {
    runner.sample({
      id: 'home-page-load-http-server',
      execute: function() {
        browser.get('http://localhost:8080/index.ng2.html');
        browser.wait($('.new-question').getText());
      },
      bindings: [
        benchpress.bind(benchpress.Options.SAMPLE_DESCRIPTION).toValue({
          server: 'http-server'
        })
      ]
    }).then(done, done.fail);
  });
});

function writeReport (heading, rows, footer) {
  console.log('');
  console.log('|-------------------')
  console.log(`|- ${heading}`);
  console.log('|-------------------');
  rows.forEach((v) => console.log('|-', v));
  console.log(`|- ${footer}`);
  console.log('|-------------------');
  console.log('');
}
