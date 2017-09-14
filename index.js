'use strict';

const path = require('path');
const Bundlebars = require('bundlebars');
const fm = require('front-matter');
const Readable = require('stream').Readable;
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
});

class BundlebarsCompiler {
  constructor(config) {
    if (config.plugins) {
      this.config = config.plugins.BundlebarsCompiler;
    }
    this.config = {
      partialsDir: './app/assets/pages/partials',
      partialsExt: '.html',
      helpersDir: './app/assets/pages/helpers',
      templatesDir: './app/assets/pages/templates',
      compilerOptions: {
        noEscape: true,
      },
    };
    this.bundlebars = new Bundlebars(this.config);
  }

  toStream(str) {
    var s = new Readable();
    s._read = function() {};
    s.push(str);
    s.push(null);
    return s;
  }

  onError(err) {
    if (err) {
      console.log(err);
      throw err;
    }
  }

  compileBundle(stream, data) {
    return this.bundlebars.compile(stream, data);
  }

  compileStatic(params) {
    var dataContent = fm(params.data);
    var content;
    var me = this;
    var htmlContent = md.render(dataContent.body).replace(/{{inc/g, '{{>');
    var body = me.compileBundle(this.toStream(htmlContent), dataContent.attributes);
    if (dataContent.attributes.template) {
      var file = path.join(this.config.templatesDir, dataContent.attributes.template);
      content = body.then(function(data) {
        dataContent.attributes.content = data;
        return me.compileBundle(file, dataContent.attributes);
      }, this.onError);
    } else {
      content = body;
    }
    return content.then(function(compiled) {
      return new Promise((resolve, reject) => {
        if (compiled === '') {
          reject('Empty data');
        } else {
          resolve(compiled);
        }
      });
    }, this.onError);
  }
}

BundlebarsCompiler.prototype.brunchPlugin = true;
BundlebarsCompiler.prototype.type = 'template';
BundlebarsCompiler.prototype.extension = 'md';
BundlebarsCompiler.prototype.staticTargetExtension = 'html';

module.exports = BundlebarsCompiler;
