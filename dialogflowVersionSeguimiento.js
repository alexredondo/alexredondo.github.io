'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin'); 						//funciones agregadas - writing en DB
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({										 //funciones agregadas - writing en DB
  	credential: admin.credential.applicationDefault(),  	//funciones agregadas - writing en DB
  	databaseURL: 'ws://academiaapp-84f02.firebaseio.com/'		 //URL de Base de datos firebase
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
  

 ///////////Datos del estudiante
  function handleDatosEstudiantes(agent) {
    const pinAcceso = agent.parameters.pin;
      return admin.database()
      .ref('results')
      .once('value')
      .then((snapshot)=>{	
        
        // Variable Datos del estudiante
        var name = snapshot.child(pinAcceso+"/nombre_comp").val();
        var tipo_doc = snapshot.child(pinAcceso+"/tipo_doc").val();   
        var nuip = snapshot.child(pinAcceso+"/nuip").val();   
        var gradoGrupo = snapshot.child(pinAcceso+"/gradoGrupo").val();
        var fecha_nac = snapshot.child(pinAcceso+"/fecha_nac").val();
        var sexo = snapshot.child(pinAcceso+"/sexo").val();
        var rh = snapshot.child(pinAcceso+"/rh").val();
        var edad = snapshot.child(pinAcceso+"/edad").val();
        
        // Respuesta datos del estudiante I
        agent.add(`\nEstos son los datos que tenemos registrados del estudiante:\n`);
        agent.add(new Card({
          title: `\nNombre:\n${name}`,
          text: `\nTipo de Documento: ${tipo_doc}\nNúmero: ${nuip} \nGrupo: ${gradoGrupo} \nFecha de Nacimiento:\n${fecha_nac}\nEdad: ${edad} años\nSexo: ${sexo}\nRH: ${rh}`
            })
          );          

        var direccion = snapshot.child(pinAcceso+"/direccion").val();
        var barrio = snapshot.child(pinAcceso+"/barrio").val();
        var celular_1 = snapshot.child(pinAcceso+"/celular_1").val();
        var celular_2 = snapshot.child(pinAcceso+"/celular_2").val();
        var email = snapshot.child(pinAcceso+"/email").val();

        // Respuesta datos del estudiante II
        agent.add(new Card({
          title: `Datos de contacto:`,
          text: `\nDirección:\n${direccion}\nBarrio: ${barrio}\nCelular 1: ${celular_1}\nCelular 2: ${celular_1}\nEmail: ${email}`
            })
          );          


        //Datos papa
        var nombre_papa = snapshot.child(pinAcceso+"/nombre_papa").val(); 
        var cedula_papa = snapshot.child(pinAcceso+"/cedula_papa").val();
        var ocupa_padre = snapshot.child(pinAcceso+"/ocupa_padre").val();
        //Datos mama
        var nombre_mama = snapshot.child(pinAcceso+"/nombre_mama").val();
        var cedula_mama = snapshot.child(pinAcceso+"/cedula_mama").val();
        var ocupa_madre = snapshot.child(pinAcceso+"/ocupa_madre").val();

        agent.add(new Card({
          title: `\nDatos de los padres de familia\n`,
          text: `Padre:\n${nombre_papa}\nCédula: ${cedula_papa}\nOcupación: ${ocupa_padre} \n\nMadre: ${nombre_mama}\nCédula: ${cedula_mama}\nOcupación: ${ocupa_madre}`
            })
          );  


        //Datos acudiente
        var acudiente = snapshot.child(pinAcceso+"/acudiente").val();
        var parenteso = snapshot.child(pinAcceso+"/parenteso").val();
        var celular_acud = snapshot.child(pinAcceso+"/celular_acud").val();
        var cedula_acud = snapshot.child(pinAcceso+"/cedula_acud").val();

        agent.add(new Card({
          title: `\nDatos del (la) acudiente`,
          text: `\nAcudiente:\n${acudiente}\nParentesco: ${parenteso}\nCédula: ${cedula_acud}\nCelular: ${celular_acud}`
            })
          );    

    }); // End then
 } // End handleDatosEstudiantes
 ////////// Fin Datos estudiantes
   
///////////Pagos
function handleReadFromDB(agent) {
  const keyRecaudo =1000;
	const pinAcceso = agent.parameters.pin;
  return admin.database()
    .ref('results')
    .once('value')
    .then((snapshot)=>{	
      
      var numeroRegistro = 979; //Número de registros + 1
      // Extracción Nombre del estudiante.
        // Variable Datos del estudiante
        var name = snapshot.child(pinAcceso+"/nombre_comp").val();
        var tipo_doc = snapshot.child(pinAcceso+"/tipo_doc").val();   
        var nuip = snapshot.child(pinAcceso+"/nuip").val();   
        var gradoGrupo = snapshot.child(pinAcceso+"/gradoGrupo").val();
        
        // Respuesta datos del estudiante I
        agent.add(new Card({
          title: `══════════════════════\nEstudiante:\n${name}`,
          text: `\nTipo de Documento: ${tipo_doc}\nNúmero: ${nuip} \nGrupo: ${gradoGrupo}\n══════════════════════`
            })
          ); 
         
    //funciones agregadas - reading en DB
    var i;
    for (i = 0; i < numeroRegistro; i++) { 
    var pinRegistro = snapshot.child(keyRecaudo+"/"+i+"/pinAcceso").val();
    if (pinRegistro === pinAcceso) {				
      var transaccion = snapshot.child(keyRecaudo+"/"+i+"/transaccion").val();
      var fecha = snapshot.child(keyRecaudo+"/"+i+"/fecha").val();
      var valor = snapshot.child(keyRecaudo+"/"+i+"/valor").val();
      var item = snapshot.child(keyRecaudo+"/"+i+"/item").val();

      agent.add(`T     📅FECHA     🔖ÍTEM      💵VALOR`);
      agent.add(`${transaccion} ║ ${fecha} ║ ${item} ║ ${valor}`);
      } // if

    }	// End for
        
    agent.add(new Card({
      title: `❓ ¿Tiene algún comentario?\n`,
      text: `Estamos atentos a su solicitud.\nPor favor escribanos`,
      buttonText: `💬 Enviar comentario`,
      buttonUrl: `https://t.me/alexredondo`
        })
      );
  }); // End then

} // End handleReadFromDB
////////// Fin Pagos


///////////PagosSaldos ////////////////////////////////////////////////////////////
function handlePagosSaldos(agent) {
  const keyRecaudo =1000;
	const pinAcceso = agent.parameters.pin;
  return admin.database()
    .ref('results')
    .once('value')
    .then((snapshot)=>{	
      
      var numeroRegistro = 979; //Número de registros + 1
      // Extracción Nombre del estudiante.
        // Variable Datos del estudiante
        var name = snapshot.child(pinAcceso+"/nombre_comp").val();
        var tipo_doc = snapshot.child(pinAcceso+"/tipo_doc").val();   
        var nuip = snapshot.child(pinAcceso+"/nuip").val();   
        var gradoGrupo = snapshot.child(pinAcceso+"/gradoGrupo").val();
        
        // Respuesta datos del estudiante I
        agent.add(new Card({
          title: `══════════════════════\nEstudiante:\n${name}`,
          text: `\nTipo de Documento: ${tipo_doc}\nNúmero: ${nuip} \nGrupo: ${gradoGrupo}\n══════════════════════`
            })
          ); 
         
    //funciones agregadas - reading en DB
    var i;
    for (i = 0; i < numeroRegistro; i++) { 
    var pinRegistro = snapshot.child(keyRecaudo+"/"+i+"/pinAcceso").val();
    if (pinRegistro === pinAcceso) {				
      var transaccion = snapshot.child(keyRecaudo+"/"+i+"/transaccion").val();
      var fecha = snapshot.child(keyRecaudo+"/"+i+"/fecha").val();
      var valor = snapshot.child(keyRecaudo+"/"+i+"/valor").val();
      var item = snapshot.child(keyRecaudo+"/"+i+"/item").val();
      var cod_recibo = snapshot.child(keyRecaudo+"/"+i+"/cod_recibo").val();
      var observaciones = snapshot.child(keyRecaudo+"/"+i+"/observaciones").val();
      var descripcionSaldo = snapshot.child(keyRecaudo+"/"+i+"/descripcionSaldo").val();
      var saldo = snapshot.child(keyRecaudo+"/"+i+"/saldo").val();
      var estado = snapshot.child(keyRecaudo+"/"+i+"/estado").val();
      agent.add(new Card({
      title: `${transaccion}+${valor}`,
      text: `📅 Fecha: ${fecha}\n ${cod_recibo}\n${observaciones}\n${descripcionSaldo}\n${saldo}\n${estado}`
           })
         );

      } // if

    }	// End for
        
    agent.add(new Card({
      title: `❓ ¿Tiene algún comentario?\n`,
      text: `Estamos atentos a su solicitud.\nPor favor escribanos`,
      buttonText: `💬 Enviar comentario`,
      buttonUrl: `https://t.me/alexredondo`
        })
      );
  }); // End then

} // End PagosSaldos
////////// Fin Pagos

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('ReadFromDB', handleReadFromDB);//pagos
  intentMap.set('DatosEstudiantes', handleDatosEstudiantes);//Datos Estudiantes
  intentMap.set('PagosSaldos', handlePagosSaldos);//Datos Estudiantes
  agent.handleRequest(intentMap);
});
