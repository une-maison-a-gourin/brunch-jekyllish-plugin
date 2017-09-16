'use strict';

const globby = require('globby');
const path = require('path');
const fm = require('front-matter');
const handlebars = require('handlebars');
const fs = require('fs');
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
});

class BundlebarsCompiler {
  constructor(config) {
    if (config.plugins && config.plugins.jekyllish) {
      this.config = config.plugins.jekyllish;
    } else {
      this.config = {
        partialsDir: './app/partials',
        partialsExt: '.html',
        templatesDir: './app/templates',
        helpersDir: './app/helpers',
        compilerOptions: {
          noEscape: true,
        },
      };
    }
    console.log('Jekyllish config:');
    console.log(this.config);
    this.registerPartials();
    this.registerHelpers();
  }

  onError(err) {
    if (err) {
      console.log(err);
      throw err;
    }
  }

  compileBundle(str, data) {
    const me = this;
    return new Promise(function(resolve, reject) {
      try {
        const template = handlebars.compile(str, me.config.compilerOptions);
        const result = template(data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  registerPartials() {
    globby([this.config.partialsDir + '/**/*' + this.config.partialsExt]).then(paths => {
      for (var p of paths) {
        var name = path.parse(p).name;
        console.log('Registering partial %s', name);
        var content = fs.readFileSync(p, 'utf8');
        handlebars.registerPartial(name, content);
      }
    });
  }

  registerHelpers() {
    globby(this.config.helpersDir + '/**/*.js').then(paths => {
      for (var p of paths) {
        console.log('Registering helper %s', p);
        require(p)(handlebars);
      }
    });
  }


  extractData(input) {
    return new Promise((resolve, reject) => {
      if (input.data === '') {
        reject('Empty data');
      } else {
        resolve(fm(input.data));
      }
    });
  }

  compileMarkdown(yaml) {
    return new Promise((resolve, reject) => {
      if (yaml === '') {
        reject('Empty markdown');
      } else {
        resolve([yaml.attributes, md.render(yaml.body).replace(/{{include /g, '{{> ')]);
      }
    });
  }

  compileTemplate(params, parent) {
    var result;
    if (params[0].template) {
      result = params[1].then(function(data) {
        const file = path.join(parent.config.templatesDir, params[0].template);
        params[0].content = data;
        return parent.compileBundle(fs.readFileSync(file, 'utf8'), params[0]);
      }, parent.onError);
    } else {
      result = params[1];
    }
    return result;
  }

  compileStatic(params) {
    return this.extractData(params)
      .then(yaml => this.compileMarkdown(yaml), this.onError)
      .then(results => [results[0], this.compileBundle(results[1], results[0])], this.onError)
      .then(results => this.compileTemplate(results, this), this.onError);
  }
}

BundlebarsCompiler.prototype.brunchPlugin = true;
BundlebarsCompiler.prototype.type = 'template';
BundlebarsCompiler.prototype.extension = 'md';
BundlebarsCompiler.prototype.staticTargetExtension = 'html';

module.exports = BundlebarsCompiler;
