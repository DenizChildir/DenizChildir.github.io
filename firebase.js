// Add your Firebase configuration here
const firebaseConfig = {
    apiKey: "AIzaSyAsELNkO3f1o9BtdI76K2q8le3BBiFF61I",
    authDomain: "video-2e82c.firebaseapp.com",
    projectId: "video-2e82c",
    storageBucket: "video-2e82c.appspot.com",
    messagingSenderId: "970667854131",
    appId: "1:970667854131:web:d205fbbf38a741cf689646",
    measurementId: "G-CSN0727MWT"
  };

firebase.initializeApp(firebaseConfig);

function uploadToFirebase(blob) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child('videos/' + new Date().toISOString()).put(blob);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
    }, (error) => {
        console.error('Upload failed:', error);
    }, () => {
        console.log('Upload complete');
    });
}
