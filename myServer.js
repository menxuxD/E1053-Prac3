const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser");

const ctrl = require('./controllers');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3030,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/',ctrl.sendStatic);

app.get('/dataset',ctrl.sendDatasets);

app.get('/dataset/:name',ctrl.sendLastPosts);


// Funciones del Ejercicio 3 & tabla 1

// GET /streams
app.get('/streams',ctrl.sendDatasets);

// GET /stream/graph1 --> Practica 2.1
app.get('/stream/graph1', ctrl.getAllGraph_1);

// GET /stream/graph2 --> Practica 2.2
app.get('/stream/graph2', ctrl.getAllGraph_2);

// GET /stream/<name>/polarity
app.get('/stream/:name/polarity', ctrl.sendPolarity);

// GET /stream/<name>limit=2
app.get('/stream/:name', ctrl.sendHistory);

// GET /stream/<name>/geo
app.get('/stream/:name/geo', ctrl.sendGeo);

// GET /stream/<name>/words?top=2
app.get('/stream/:name/words', ctrl.sendMaxOccurs);

// GET /stream/<name>/graphname 
app.get('/stream/:name/graph', ctrl.getGraph);


ctrl.warmup.once("warmup", _ => {
   console.log("Web server running on port 8080");
   //app.listen(8080);
   app.listen(port, ip);
   console.log('Server running on http://%s:%s', ip, port);
});

