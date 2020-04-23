function registrar(){
    console.log("Diste un click en Registrar");
    var emailRegistro = document.getElementById('emailRegistro').value;
    var passwordRegistro = document.getElementById('passwordRegistro').value;
    console.log("este es el email: " + emailRegistro);
    console.log("Este es el password: "+ passwordRegistro);

    firebase.auth().createUserWithEmailAndPassword(emailRegistro, passwordRegistro)
    .catch(function(error) { // catch es una promesa. Si no funciona createUser....
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
}

function ingreso(){
    console.log("Diste un click");
    var emailIngreso = document.getElementById('emailIngreso').value;
    var passwordIngreso = document.getElementById('passwordIngreso').value;
    console.log("este es el email: " + emailIngreso);
    console.log("Este es el password: "+ passwordIngreso);

    firebase.auth().signInWithEmailAndPassword(emailIngreso, passwordIngreso)
    .catch(function(error) { // catch es una promesa. Si no funciona createUser....
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
}

function observadorUsuario(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          console.log("EXISTE usuario activo");
          despliega();
          name = user.displayName;
          console.log(name);
          email = user.email;
          console.log(email);
          photoUrl = user.photoURL;
          console.log(photoUrl);
          emailVerified = user.emailVerified;
          console.log(emailVerified);
          uid = user.uid; 
          console.log(uid);
          console.log(user);
        } else {
          // No user is signed in.
          console.log("No existe usuario activo");
        }
      });
}

observadorUsuario()

function despliega(){
    var contenido = document.getElementById("contenido");
    contenido.innerHTML = `
    <p>Bienvendio!</p>
    <button onclick="cerrar()">Cerrar Sesión</button>
    `;
    }

function cerrar(){

    firebase.auth().signOut()
    .then(function() {
        // Sign-out successful.
        console.log("Saliendo ...");
      })
    .catch(function(error) {
        // An error happened.
        console.log(error);
      });
}