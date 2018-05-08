(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "defaults":
		{
			"updateInterval": 600000
		}
}
},{}],2:[function(require,module,exports){
/* global Module */

/* Magic Mirror
 * Module: NewsFeed
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

const defaultConfig = require ('../defaultConfig.json');
Log.info("Module updatenotification configuration: " + JSON.stringify(defaultConfig.defaults));

Module.register("updatenotification", {

	defaults: defaultConfig.defaults,

	status: false,

	start: function () {
		Log.log("Start updatenotification");

	},

	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			this.sendSocketNotification("CONFIG", this.config);
			this.sendSocketNotification("MODULES", Module.definitions);
			this.hide(0, { lockString: self.identifier });
		}
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "STATUS") {
			this.status = payload;
			this.updateUI();
		}
	},

	updateUI: function () {
		var self = this;
		if (this.status && this.status.behind > 0) {
			self.updateDom(0);
			self.show(1000, { lockString: self.identifier });
		}
	},

	diffLink: function(text) {
		var localRef = this.status.hash;
		var remoteRef = this.status.tracking.replace(/.*\//, "");
		return "<a href=\"https://github.com/MichMich/MagicMirror/compare/"+localRef+"..."+remoteRef+"\" "+
			"class=\"xsmall dimmed\" "+
			"style=\"text-decoration: none;\" "+
			"target=\"_blank\" >" +
			text +
			"</a>";
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");

		if (this.status && this.status.behind > 0) {
			var message = document.createElement("div");
			message.className = "small bright";

			var icon = document.createElement("i");
			icon.className = "fa fa-exclamation-circle";
			icon.innerHTML = "&nbsp;";
			message.appendChild(icon);

			var subtextHtml = this.translate("UPDATE_INFO", {
				COMMIT_COUNT: this.status.behind + " " + ((this.status.behind == 1) ? "commit" : "commits"),
				BRANCH_NAME: this.status.current
			});

			var text = document.createElement("span");
			if (this.status.module == "default") {
				text.innerHTML = this.translate("UPDATE_NOTIFICATION");
				subtextHtml = this.diffLink(subtextHtml);
			} else {
				text.innerHTML = this.translate("UPDATE_NOTIFICATION_MODULE", {
					MODULE_NAME: this.status.module
				});
			}
			message.appendChild(text);

			wrapper.appendChild(message);

			var subtext = document.createElement("div");
			subtext.innerHTML = subtextHtml;
			subtext.className = "xsmall dimmed";
			wrapper.appendChild(subtext);
		}

		return wrapper;
	}
});

},{"../defaultConfig.json":1}]},{},[2]);
