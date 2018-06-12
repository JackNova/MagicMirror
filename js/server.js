/* Magic Mirror
 * Server
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var path = require("path");
var ipfilter = require("express-ipfilter").IpFilter;
var fs = require("fs");
var helmet = require("helmet");
var Utils = require(__dirname + "/utils.js");
const modules = require(__dirname + "/../config/modules.json");

var Server = function(params, callback) {
    const config = params.config;
    const aviableModules = params.aviableModules;

    const coreApp = params.coreApp;

    let moduliDisponibili = ""; // Moduli disponibli ma non presenti nel file config
    let pathDefault = "modules/default";
    let pathCustom = "modules/custom";

    console.log(aviableModules);
    var port = config.port;
    if (process.env.MM_PORT) {
        port = process.env.MM_PORT;
    }

    console.log("Starting server on port " + port + " ... ");

    server.listen(port, config.address ? config.address : null);

    if (config.ipWhitelist instanceof Array && config.ipWhitelist.length == 0) {
        console.info(
            Utils.colors.warn(
                "You're using a full whitelist configuration to allow for all IPs"
            )
        );
    }

    function getFiles(dir) {
        let files_ = [];
        var files = fs.readdirSync(dir);
        let moduleName;
        for (var i in files) {
            var name = dir + "/" + files[i];
            if (name.indexOf(".") == -1) {

                moduleName = name.split("/")[2];
                files_.push(moduleName);
            }
        }
        if(files_.length > 0){
            return JSON.stringify(files_);
        }else{
            return;
        }
    }

    if(getFiles(pathDefault)){
    fs.writeFile("config/availableModules.json", getFiles(pathDefault), function(err) {
        if (err) throw err;
    });}
    if(getFiles(pathCustom)){
    fs.appendFile("config/availableModules.json", getFiles(pathCustom), function(err) {
        if (err) throw err;
    });}

    app.use(function(req, res, next) {
        var result = ipfilter(config.ipWhitelist, {
            mode: config.ipWhitelist.length === 0 ? "deny" : "allow",
            log: false
        })(req, res, function(err) {
            if (err === undefined) {
                return next();
            }
            console.log(err.message);
            res.status(403).send(
                "This device is not allowed to access your mirror. <br> Please check your config.js or config.js.sample to change this."
            );
        });
    });
    app.use(helmet());

    app.use("/js", express.static(__dirname));
    var directories = [
        "/config",
        "/css",
        "/fonts",
        "/modules",
        "/vendor",
        "/translations",
        "/tests/configs"
    ];
    var directory;
    for (var i in directories) {
        directory = directories[i];
        app.use(
            directory,
            express.static(path.resolve(global.root_path + directory))
        );
    }

    app.get("/version", function(req, res) {
        res.send(global.version);
    });

    app.get("/config", function(req, res) {
        res.send(config);
    });

    app.get("/availableModules", function(req, res) {
        var html = fs.readFileSync(
            path.resolve(global.root_path + "/config/availableModules.json"),
            { encoding: "utf8" }
        );
        res.send(html);
    });

    app.get("/", function(req, res) {
        var html = fs.readFileSync(
            path.resolve(global.root_path + "/index.html"),
            { encoding: "utf8" }
        );
        html = html.replace("#VERSION#", global.version);

        configFile = "config/config.js";
        if (typeof global.configuration_file !== "undefined") {
            configFile = global.configuration_file;
        }

        html = html.replace("#CONFIG_FILE#", configFile);

        res.send(html);
    });

    /*
	Post per salvataggio configurazione moduli da webapp
	*/
    app.post("/modulesconfig", function(req, res) {
        whole = "";
        let json;
        let fs;
        req.on("data", chunk => {
            whole += chunk;
        });
        req.on("end", () => {
            json = JSON.parse(whole);
            console.log("Saving the following config:");
            console.log(JSON.stringify(json));
            fs = require("fs");
            fs.writeFile("config/modules.json", JSON.stringify(json), function(
                err
            ) {
                if (err) throw err;
                else {
                    coreApp.restart();
                }
            });
        });
    });

    /*
	Pagina dedicata alla configurazione dei moduli
	*/
    app.get("/modulesconfig", function(req, res) {
        var html = fs.readFileSync(
            path.resolve(global.root_path + "/modules.html"),
            { encoding: "utf8" }
        );
        res.send(html);
    });

    if (typeof callback === "function") {
        callback(app, io);
    }
};

module.exports = Server;
