const video = document.getElementById('video');
let mediaRecorder;
let recordedChunks = [];
let recordInterval;
let db;

// Initialize IndexedDB
function initDB() {
  const request = indexedDB.open('videosDB', 1);
  request.onerror = function (event) {
    console.error('Error opening IndexedDB', event);
  };
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore('videos', { autoIncrement: true });
  };
  request.onsuccess = function (event) {
    db = event.target.result;
  };
}

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedChunks = [];

      // Store blob in IndexedDB
      storeBlob(blob);

      // Upload to Firebase
      uploadToFirebase(blob);

      // Restart the recording automatically
      startNewRecording();
    };

    // Start the first recording
    startNewRecording();
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

function startNewRecording() {
  mediaRecorder.start();
  recordInterval = setTimeout(() => {
    mediaRecorder.stop();
  }, 8000); // stop recording after 15 seconds
}

// Store blob in IndexedDB
function storeBlob(blob) {
  const transaction = db.transaction(['videos'], 'readwrite');
  const objectStore = transaction.objectStore('videos');
  objectStore.add(blob);
}

// Dummy function for uploading to Firebase
// Replace with actual Firebase upload logic
function uploadToFirebase(blob) {
  const storageRef = firebase.storage().ref();
  const videoRef = storageRef.child(`videos/${new Date().toISOString()}.webm`);
  
  videoRef.put(blob).then((snapshot) => {
    console.log('Uploaded a blob or file!', snapshot);
  }).catch((error) => {
    console.error('Upload failed:', error);
  });
}


initDB();
initCamera();
