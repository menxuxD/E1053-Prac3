const Twitter = require('twitter')
const myCreds = require('./credentials/my-credential.json');
const mydb = require('./myStorage.js');
const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');

const mng=require('mongoose');
const my_conn_data="mongodb://al317217:menxu96@ds247759.mlab.com:47759/mydb_al317217";
//Creamos la conexion con nuestra base de datos
mng.connect(my_conn_data);

var itemSchema = new mng.Schema({
  "@context": String,
  "@type": String,
  "identifier": String,
  "query": String,
  "agent": String,
  "startTime": Date,
  "@id": String
});

var ItemModel = mng.model('Item', itemSchema);

class StreamManager{

	constructor(){
		this.streams={}; // Diccionario de Streams (Clave:NombreStream, Valor: ObjetoStream)
        	this.DB = new mydb.myDB('./data'); // Creamos la base de datos y los datos lo almacenamos en el directorio data
		console.log("StreamManager Constructor");
	}


	createStream(name, track2){

		let stream = client.stream('statuses/filter', {track: track2});
		console.log("Objeto Stream Creado & Insertado en el diccionario");
		
		var jsonLD = ctrl.createJSONLD(name, track2);
		var metadato = new ItemModel(jsonLD);
		metadato.save();		

		this.DB.createDataset(name,{"description":"esto es sobre "+ name, "track": track2});// Creamos un dataset y le ponemos una descripcion.

		stream.on('data', tweet => {
		  if (tweet.lang=="es" || tweet.user.lang=="es"){
		     console.log(tweet.id_str,tweet.text);
		     console.log("Sentiment score:",sentiment(tweet.text).score);

		     // Insertamos en el dataset, un objeto por cada tweet (con su informacion) que filtramos. 
             this.DB.insertObject(name,{id:tweet.id_str,texto:tweet.text,coord:tweet.coordinates,polaridad:sentiment(tweet.text).score});
		  }
		});

		stream.on('error', err => console.log(err));

		// Insertamos en el diccionario el nuevo stream con la clave name.
		this.streams[name] = stream;

	}

	destroyStream(name){

		let stream = this.streams[name];

		// Destruimos el objeto stream
		stream.destroy();

		// Borramos la refencia a dicho objeto
		delete this.streams[name];

		console.log("Objeto Stream borrado");
	}
}

exports.StreamManager = StreamManager;
