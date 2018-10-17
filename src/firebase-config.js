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

export default firebase;

export const firebaseApp = firebase;
export const firebaseAuth = firebaseApp.auth();
export const googleProvider = new firebaseApp.auth.GoogleAuthProvider();
export const database = firebaseApp.database();
