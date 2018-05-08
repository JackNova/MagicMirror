/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

const defaultConfig = require('../defaultConfig.json');
Log.info("Module helloworld configuration: " + JSON.stringify(defaultConfig));

Module.register("helloworld",{

	// Default module config.
	defaults: defaultConfig,

	getTemplate: function () {
		return "helloworld.njk"
	},

	getTemplateData: function () {
		return this.config
	},

	start: function() {
		Log.info("Starting module: " + this.name);
	}
});
