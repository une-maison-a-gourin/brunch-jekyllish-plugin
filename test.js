'use strict';

const expect = require('chai').expect;
const Plugin = require('./');
const fs = require('fs');

describe('Plugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new Plugin({paths: {root: '.'}});
  });

  it('should be an object', () => {
    expect(plugin).to.be.ok;
  });

  it('should has #compileStatic method', () => {
    expect(plugin.compileStatic).to.be.an.instanceof(Function);
  });

  it('should compileStatic and produce valid result', () => {
    // Setup
    var expected = "<!DOCTYPE html>\n<head>\n  <title>Hi</title>\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n</head>\n<body>\n  <div class=\"header\">\n    <a href=\"index.html\" class=\"logo\" style=\"background-image:url(img/logo.svg);\"></a>\n  \n    <div class=\"nav\">\n      <a href=\"index.html\" class=\"nav__item \">Home</a>\n      <a href=\"about.html\" class=\"nav__item  nav__item_active\">About</a>\n    </div>\n  </div>\n\n  <div class=\"content\">\n    <h1>Just hack\'n</h1>\n  <p>And this is the body of the content with the description of</p>\n  <p>Nothing to see here</p>\n  <p>inserted by bundlebars and also a partial of</p>\n  <p><h1>Hi from apart</h1>\n  </p>\n  <p>inserted.</p>\n  \n  </div>\n\n  <div class=\"footer\">2017 &copy; Copyleft</div>\n</body>\n</html>\n";
    var testFilePath = './app/assets/pages/test.md';
    var testData = fs.readFileSync(testFilePath, 'utf8');

    // Test
    return plugin.compileStatic({data: testData, path: testFilePath}).then(got => {
      expect(got).to.equal(expected);
    }, error => expect("Got " + got + " " + error).not.to.be.ok);
  });

});
