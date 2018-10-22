import firebase from "firebase";

const config = {
  apiKey: "AIzaSyC6gvbFhVRuvbLyVRACGaA4lQjTuAApa9M",
  authDomain: "testfirebase-71bb3.firebaseapp.com",
  databaseURL: "https://testfirebase-71bb3.firebaseio.com",
  projectId: "testfirebase-71bb3",
  storageBucket: "testfirebase-71bb3.appspot.com",
  messagingSenderId: "641513398983"
};

firebase.initializeApp(config);

const firebaseAuth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const database = firebase.database();

export { firebaseAuth, googleProvider, database };
