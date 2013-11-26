"use strict";

var Blink1Reporter = function (helper, logger, config) {

    function hex2rgb(hex) {
        if (hex[0] === "#") {
            hex = hex.substr(1);
        }
        if (hex.length === 3) {
            var temp = hex;
            hex = '';
            temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
            for (var i = 0; i < 3; i++) {
                hex += temp[i] + temp[i];
            }
        }
        var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
        return {
            red: parseInt(triplets[0], 16),
            green: parseInt(triplets[1], 16),
            blue: parseInt(triplets[2], 16)
        }
    }

    function changeColorTo(color, duration, stop) {
        var path = require('path')
        var exec = require('child_process').exec;
        var child;

        var rgb = hex2rgb(color);

        var blinkStr = (stop !== true) ? "" : " --blink 1";

        var parentDir = path.resolve(__dirname, './lib');
        child = exec("blink1-tool --rgb " + rgb.red + "," + rgb.green + "," + rgb.blue + " -m " + (duration * 1000) + "" + blinkStr, {cwd: parentDir}, function (error, stdout, stderr) {
//            log.info('stdout: ' + stdout);
//            if (stderr !== null) {
//                log.warn('stderr: ' + stderr);
//            }
            if (error !== null) {
                log.info('exec error: ' + error);
            }
        });
    }

    var DEFAULT_CONFIG = {
        fault: 'FF6600',
        error: 'FF0000',
        success: '00FF00',
        duration: 1.5
    };

    config = helper.merge(DEFAULT_CONFIG, config);
    var log = logger.create('reporter.blink1');

//    this.onRunStart = function () {
//        changeColorTo(config.fault, config.duration);
//    };

    this.onSpecComplete = function(browser, result) {
        log.info('result: ' + result.success);
        log.info('browser: ' + browser);
        if (result.skipped) {
            changeColorTo(config.fault, config.duration);
        } else if (result.success) {
            changeColorTo(config.success, config.duration);
        } else {
            changeColorTo(config.error, config.duration);
        }
//
//        if (reportSlow && result.time > reportSlow) {
//            var specName = result.suite.join(' ') + ' ' + result.description;
//            var time = helper.formatTimeInterval(result.time);
//
//            this.writeCommonMsg(util.format(this.SPEC_SLOW, browser, time, specName));
//        }
    };

    this.onBrowserComplete = function (browser) {
        var results = browser.lastResult;
        if (results.disconnected || results.error) {
            changeColorTo(config.fault, config.duration, true);
        } else if (results.failed) {
            changeColorTo(config.error, config.duration, true);
        } else {
            changeColorTo(config.success, config.duration, true);
        }
    };

//    this.onBrowserComplete = function (browser) {
//        var results = browser.lastResult;
//        if (results.disconnected || results.error) {
//            changeColorTo(config.fault, config.duration);
//        } else if (results.failed) {
//            changeColorTo(config.error, config.duration);
//        } else {
//            changeColorTo(config.success, config.duration);
//        }
//    };
};

Blink1Reporter.$inject = ['helper', 'logger', 'config.blink1'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:blink1': ['type', Blink1Reporter]
};
