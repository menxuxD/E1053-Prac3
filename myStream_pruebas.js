const SM = require('./myStream.js');

let st = new SM.StreamManager();

st.DB.events.once("warmup", _ =>{
	  // CreateStreams
	  st.createStream('barcelona', 'barcelona');
	  st.createStream('valencia', 'valencia');
	  st.createStream('castellon', 'castellon');


	  // DestroyStreams a los 10 Segundos
	  setTimeout(_ => st.destroyStream('barcelona'),10000);
	  setTimeout(_ => st.destroyStream('valencia'),10000);
	  setTimeout(_ => st.destroyStream('castellon'),10000);
});




