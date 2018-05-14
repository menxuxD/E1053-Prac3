const db=require('./myStorage');
const _ = require("underscore");
let  DB = new db.myDB('./data');
const https = require('https');
const mng=require('mongoose');
const my_conn_data="mongodb://al317217:menxu96@ds247759.mlab.com:47759/mydb_al317217";
//Creamos la conexion con nuestra base de datos
//mng.connect(my_conn_data);


exports.sendStatic    = (req,res) => res.sendFile("public/index.html",{root:application_root});

exports.sendDatasets  = (req,res) => {
	let counts = _.sortBy(_.pairs(DB.getCounts()),x => -x[1]); //Parseamos a parejas de clave, valor, y las ordenamos por la cantidad de valor de menor a mayor.
	res.send({result: counts}); 
}
exports.sendCounts    = (req,res) => res.send({error:"No operativo!"});

exports.sendLastPosts = (req,res) => {
    let n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,data => res.send(data));
};


// Funciones del Ejercicio 3 & tabla 1
exports.sendPolarity = (req, res) =>{
	let resultado = {positive:0, negative:0, neutral:0};

	BD.getLastObject(req.params.streamName, 0, (data) => {
		for (let item in data['result']){
			// Convertirlo todo a numeros, hay veces que esta en cadenas -.-'
			if (typeof item.polarity == "string"){item.polarity= parseInt(item.polarity.split(",").slice(-1)[0]);}
			// Calcular la polaridad
			if (item['polarity'] == 0){resultado.neutral++;}
			else if (item['polarity'] < 0){resultado.negative++;}
			else if (item['polarity'] > 0){resultadopositive++;}
		}
		res.send({"result":resultado});
	});
}

exports.sendHistory = (req, res) =>{
	
	DB.getLastObjects(req.params.name,50,function(data){
   	var streamList = data.result;
	let limit = req.query.limit;
	let history ={};
    	streamList.forEach(function(streamText){
		// limpiamos la cadena de simbolos y caracteres especiales
		streamText.x.replace(/[,.;:!#]/g,'');
		// creamos un diccionario de palabras muy comunes que no nos interesan y filtramos la cadena para que no las tenga en cuenta.
		let stopWords = new Set(["el", "la", "los", "un", ""]);
		history= _.countBy(streamText.split(" ").filter(w=>!stopWords.has(w)),x=>x.toLowerCase());
      });

     });
    res.send({"result":history});
}


exports.sendGeo = (req, res) =>{
	// Conseguimos los ultimos 100 objetos de la bbdd
	DB.getLastObjects(req.params.name,100,function(data){
    		var lista=data.result;
   		 var listaGeo = {};
		// los recorremos y guardamos sus coordenadas en la lista
   		 lista.forEach(function(x){
      		if(x.coordenadas != null) listaGeo[x.id]=x.coordenadas;
    		});
	});
	res.send({"result":listaGeo});
}

exports.sendMaxOccurs = (req, res) =>{
	var number =req.query.top;
	if(number<=0){
    number = 10;
	}
	DB.getLastObjects(req.params.name,number,function(data){
    var lista=data.result;
    var listaId = [];
    lista.forEach(function(x){
      listaId.push(x.id);
    });
    res.send({"result":listaId});
  });
}

function generateJSONLD(name,track){
   return { "@type":"SenamearchAction",
	    "@identifier":name,
	    "@query":"http://localhost:8080/dataset/"+name,
	    "@agent":"Carmen Moles",
	    "@startTime": Date(),
	    "@id":track
	}
}

exports.getGraph = (req, res) =>{
	var id= req.params.name;
	DB.getMetaData(id, track => {
           res.send({
		"@context":"http://schema.org/",
		"@type":"SearchAction",
		"@identifier":id,
		"@query":"http://localhost:8080/dataset/"+id,
		"@agent":"Canamermen Moles",
		"@startTime": Date(),
		"@id":track});
        });
}

exports.getAllGraph_1 = (req, res) =>{
    // Practica 2.1 
    var lista= DB.getDatasets();
    var proms = lista.map(name => new Promise((resolve,reject)=>{ DB.getMetaData(name, track => {
                 resolve(generateJSONLD(name,track))  
    		})}));
    Promise.all(proms).then(values => {
                                      res.send({"@context":"http://schema.org/", "@graph": values})
                                      });
    
}

exports.getAllGraph_2 = (req, res) =>{
    // Practica 2.2 --> FALLA!
    https.get('https://api.mlab.com/api/1/databases/mydb_al317217/collections/twitter?apiKey=peq0cFkkGOCDWwrz1cMyyunvh8tVoiQb', function(next){
	next.on('data', function(json){
     		var data=JSON.parse(json);
     		res.send({"@context":"http://mlab.com/",'@graph': data});
 	})  
        .on('error', (e) => {
  		console.error(e);
        })
    });
}


exports.warmup = DB.events;
