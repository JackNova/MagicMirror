(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "defaults":
		{
		"text": "HELLO WORLD!"
		}
}
},{}],2:[function(require,module,exports){
/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

const defaultConfig = require('../defaultConfig.json');
Log.info("Module helloworld configuration: " + JSON.stringify(defaultConfig.defaults));

Module.register("helloworld",{

	// Default module config.
	defaults: defaultConfig.defaults,

	getTemplate: function () {
		return "helloworld.njk"
	},

	getTemplateData: function () {
		return this.config
	},

	start: function() {
		Log.info("Starting module: " + this.name + " with config: " + JSON.stringify(this.config));
	}
});

},{"../defaultConfig.json":1}]},{},[2]);
