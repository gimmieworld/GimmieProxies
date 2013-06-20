var fs = require('fs'),
    gimmie = require('gimmie-node'),
    http = require('http'),
    https = require('https'),
    mime = require('mime'),
    path = require('path'),
    querystring = require('querystring'),
    url = require('url'),
    jade = require('jade');

var Cookies = require('cookies');
var ApiProxy = gimmie.ApiProxy;

 var endpoint = 'http://api.d.gimmie.lab:3000';

var api = new ApiProxy({
  'cookie_key':   '_gm_user',
  'oauth_key':    '0a60299a6b0148ab76593b8e6e4e',
  'oauth_secret': 'c42bbd91cb9ff6c818f1ef50a07a',
  'url_prefix':   endpoint
});

var server = http.createServer(
  function (req, res) {
    var cookies = new Cookies(req, res);
    var target = url.parse(req.url).pathname;

    if (target === '/') {
      target += 'index.html';
    }

    if (target === '/gimmie') {
      api.proxy(req, res);
      return;
    }
    else if (/^\/system/.test(target)) {
      try {
        var service = http;
        if (/^https/.test(endpoint)) {
          service = https;
        }
        service.get(endpoint + req.url, function (proxy) {
          res.writeHead(proxy.statusCode, proxy.headers);
            proxy.pipe(res);
          });
      } catch (e) {
        res.writeHead(404, {});
        res.end();
      }
      return;
    }

    var _path = path.join(__dirname, '..', 'static', target);
    if (fs.existsSync(_path)) {

      var _url = url.parse(req.url);
      var _query = querystring.parse(_url.query);
      if (_query) {
        if (_query['user']) {
          cookies.set('_gm_user', _query['user']);
        }
        else if (_query['logout']) {
          cookies.set('_gm_user');
        }
      }


      if (/\.jade$/.test(_path)) {

        var options = {
          compileDebug: true,
          debug: false,
          pretty: true,
          cache: false
        }

        if (cookies.get('_gm_user') || _query['user']) {
          options.user = _query['user'] || cookies.get('_gm_user');
        }

        if (_query['logout']) {
          delete options.user;
        }
        
        jade.renderFile(_path, options, function (err, str) {
          if (err) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(err.toString());
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Pragma': 'no-cache',
            'Expires': '-1'
          });
          res.end(str);
        });
      }
      else {
        res.writeHead(200, {
          'Content-Type': mime.lookup(_path)
        });

        var fileStream = fs.createReadStream(_path);
        fileStream.pipe(res);
      }

    }
    else {
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      res.end('Not Found');
    }
  });

server.listen(8080, '0.0.0.0');
console.log ('server listen on 8080');

process.on('uncaughtException', function (err) {
  console.log (err);
  console.log (err.stack);
  process.exit(-1);
});
