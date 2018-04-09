firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
	  // User is signed in.
	  console.log('User is signed in.', user);
	} else {
	  // No user is signed in.
	  console.log('No user is signed in.', user);
	}
  });

function logIn(){
	firebase.auth().signInWithEmailAndPassword('caio.vitullo@hotmail.com', 'hotmail').catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...
	  });
}

function logOut(){
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		console.log('vazo');
	  }).catch(function(error) {
		// An error happened.
		console.log('deu bosta');
	  });
}
function insert(userId){
	firebase.database().ref('customers/' + userId).set({
		username: 'Nome ' + userId,
		email: 'Email ' + userId,
		id:userId
	  });
}
function insertAllProjects(){
	
		var data=[
			{name:'Project 1', id:1, enabled:true, data:{indicador1:Math.random(), indicador2:Math.random(),indicador3:Math.random(),indicador4:Math.random(),indicador5:Math.random(),indicador6:Math.random(),indicador7:Math.random()}},
			{name:'Project 2', id:2, enabled:true, data:{indicador1:Math.random(), indicador2:Math.random(),indicador3:Math.random(),indicador4:Math.random(),indicador5:Math.random(),indicador6:Math.random(),indicador7:Math.random()}},
			{name:'Project 3', id:3, enabled:false, data:{indicador1:Math.random(), indicador2:Math.random(),indicador3:Math.random(),indicador4:Math.random(),indicador5:Math.random(),indicador6:Math.random(),indicador7:Math.random()}},
			{name:'Project 4', id:4, enabled:true, data:{indicador1:Math.random(), indicador2:Math.random(),indicador3:Math.random(),indicador4:Math.random(),indicador5:Math.random(),indicador6:Math.random(),indicador7:Math.random()}},
			{name:'Project 5', id:5, enabled:true, data:{indicador1:Math.random(), indicador2:Math.random(),indicador3:Math.random(),indicador4:Math.random(),indicador5:Math.random(),indicador6:Math.random(),indicador7:Math.random()}}
		];
	data.forEach(i => firebase.database().ref('projects/'+i.name).set(i));
	
}
function readProject(id){
	firebase.database().ref('projects/' + id).once('value').then( function(item){
		console.log(item.val());
	})
}
function syncRead(id){
	firebase.database().ref('/projects/' +id).on('value',function(item){
		console.log('get ' + id, item.val());
	});
}
function getByID(id){
	firebase.database().ref('/projects').orderByChild('id').equalTo(id).once('value').then(function(item){console.log(item.val().data)})
}
function update(id){
	var updates = {};
	updates['/customers/' + id] = {haPegadinha:true};
	firebase.database().ref().update(updates);
}
function read(id){
	firebase.database().ref('/projects/' +id).once('value').then(function(item){
		console.log('get ' + id, item.val());
	});
}
$(function(){

	const db = firebase.database().ref().child('object');
	db.on('value', i=> console.log(i,i.val()) );
})