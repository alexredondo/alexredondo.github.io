'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin'); 						//funciones agregadas - writing en DB
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({										 //funciones agregadas - writing en DB
	credential: admin.credential.applicationDefault(),  	//funciones agregadas - writing en DB
  	databaseURL: 'ws://academiaapp-84f02.firebaseio.com/'		 //funciones agregadas - writing en DB
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  

 /////////
  function handleReadFromDB(agent) {//funciones insertadas -inicio
    const pin = agent.parameters.pin;	
    return admin.database()
      .ref('results')
      .once('value')
      .then((snapshot)=>{	
        
        var numeroRegistro = 3072; //Número de registros + 1
        // Extracción Nombre del estudiante.
        var j;
        for (j = 0; j < numeroRegistro; j++) {
          var nombreEstudiante = snapshot.child(j+"/nombre_comp").val();
          var grado = snapshot.child(j+"/gradoGrupo").val();
          var nuip = snapshot.child(j+"/nuip").val();   
          var pinNombre = snapshot.child(j+"/pinAcceso").val();
          if (pinNombre === pin) { 
            agent.add(`Estudiante:\n ${nombreEstudiante}\n NUIP: ${nuip}\n Grado: ${grado}` ); 
            break; }
          }
		       
      //funciones agregadas - reading en DB
      var i;
      for (i = 0; i < numeroRegistro; i++) { 
      //var value = snapshot.child(j+"/estudiante").val();
      var pinRegistro = snapshot.child(i+"/pinAcceso").val();
      var transaccion = snapshot.child(i+"/transaccion").val();
      var fecha = snapshot.child(i+"/fechaRecaudo").val();
      var valor = snapshot.child(i+"/valor").val();
      var cod_recibo = snapshot.child(i+"/cod_recibo").val();
      var observaciones = snapshot.child(i+"/observaciones").val();
      var descripcionSaldo = snapshot.child(i+"/descripcionSaldo").val();
      var saldo = snapshot.child(i+"/saldo").val();
      var estado = snapshot.child(i+"/estado").val();
    	if (pinRegistro === pin) {				
        //agent.add(`Hola: ${value}. Fecha de la *transacción* es: ${fecha}`);      
        agent.add(new Card({
          title: `${transaccion}+${valor}`,
          //imageUrl: `https://developers.google.com/actions/assistant.png`,
          text: `📅 Fecha: ${fecha}\n ${cod_recibo}\n${observaciones}\n${descripcionSaldo}\n${saldo}\n${estado}`
          //buttonText: `Comentario`,
          //buttonUrl: `https://assistant.google.com/`
            })
          );       
        } // if

      }	// End for
      
      agent.add(new Suggestion(`Elige 👉 /start 👈 para iniciar`));
      agent.add(new Suggestion(`/start`));
      
      agent.add(new Card({
        title: `¿Tiene algún comentario?`,
        text: `Por favor escribanos`,
        buttonText: `📝 Enviar comentario`,
        buttonUrl: `https://t.me/alexredondo`
          })
        );
    }); // End then
 } // End handleReadFromDB
 //////////
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('ReadFromDB', handleReadFromDB);//funciones insertadas
  agent.handleRequest(intentMap);
});
