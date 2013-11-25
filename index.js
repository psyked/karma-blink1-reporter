var http = require("http");

var Blink1Reporter = function (helper, logger, config) {

function hex2rgb(hex) {
  if (hex[0]=="#") hex=hex.substr(1);
  if (hex.length==3) {
    var temp=hex; hex='';
    temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
    for (var i=0;i<3;i++) hex+=temp[i]+temp[i];
  }
  var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
  return {
    red:   parseInt(triplets[0],16),
    green: parseInt(triplets[1],16),
    blue:  parseInt(triplets[2],16)
  }
}

    function changeColorTo(color, duration) {
//         request(config.baseUrl + 'fadeToRGB?rgb=%23' + color + '&time=' + duration, function () {
//             log.debug('Changed blink1 to ' + color);
//         }, function (err) {
//             log.warn('Could not change color of blink1\n' + err);
//         });
// http://nodejs.org/api.html#_child_processes
//var sys = require('sys')
var exec = require('child_process').exec;
var child;

var rgb = hex2rgb(color);

child = exec("blink1-tool --rgb "+rgb.red+","+rgb.green+","+rgb.blue+"", function (error, stdout, stderr) {
  log.info('stdout: ' + stdout);
  log.warn('stderr: ' + stderr);
  if (error !== null) {
    log.info('exec error: ' + error);
  }
});
    }

    // Code inspired by: http://stackoverflow.com/questions/9577611/http-get-request-in-node-js-express
    function request(address, onResult, onError) {
        var req = http.request(address, function (res) {
            var output = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                output += chunk;
            });
            res.on('end', function () {
                var obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            });
        });
        req.on('error', function (err) {
            onError && onError(err);
        });
        req.end();
    }

    var DEFAULT_CONFIG = {
        baseUrl: 'http://localhost:8934/blink1/',
        fault: 'FFFF00',
        error: 'FFF000',
        success: '00FF00',
        duration: 1.5
    };

    var config = helper.merge(DEFAULT_CONFIG, config);
    var log = logger.create('reporter.blink1');

    this.onRunStart = function () {
        // request(config.baseUrl + 'enumerate', function (statusCode, result) {
//             if (result.blink1Id) {
//                 log.info('blink1 found (ID:' + result.blink1Id + ')');
//             } else {
//                 log.warn('No blink1 found');
//             }
//         }, function (err) {
//             log.warn('Error looking up blink1\n' + err);
//         });
changeColorTo(config.fault, config.duration);
    };

    this.onBrowserComplete = function (browser) {
        var results = browser.lastResult;
        if (results.disconnected || results.error) {
            changeColorTo(config.fault, config.duration);
        } else if (results.failed) {
            changeColorTo(config.error, config.duration);
        } else {
            changeColorTo(config.success, config.duration);
        }
    };
};

Blink1Reporter.$inject = ['helper', 'logger', 'config.blink1'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:blink1': ['type', Blink1Reporter]
};
