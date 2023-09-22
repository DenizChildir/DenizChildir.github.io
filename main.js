const video = document.getElementById('video');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
let mediaRecorder;
let recordedChunks = [];
let recordInterval;
let db;
let isRecording = false;

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
      if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = stopHandler;
  } catch (error) {
    console.error('Error accessing the camera:', error);
  }
}

function startHandler() {
  console.log('Start button clicked');
  if (isRecording) return;
  isRecording = true;
  startRecording();
}

function stopHandler() {
  console.log('Stop button clicked');
  if (!isRecording) return;
  isRecording = false;
  clearTimeout(recordInterval);
  mediaRecorder.stop();
  processRecording();
}

function startRecording() {
  if (!isRecording) return;
  recordedChunks = [];
  mediaRecorder.start();
  recordInterval = setTimeout(() => {
    mediaRecorder.stop();
    processRecording();
    if (isRecording) startRecording(); // If still recording, start a new segment.
  }, 8000);
}

function processRecording() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  storeBlob(blob);
  uploadToFirebase(blob);
}

function storeBlob(blob) {
  const transaction = db.transaction(['videos'], 'readwrite');
  const objectStore = transaction.objectStore('videos');
  objectStore.add(blob);
}

function uploadToFirebase(blob) {
  // Add the Firebase upload logic here.
  console.log('Attempt to upload to Firebase');
}

startRecordingButton.addEventListener('click', startHandler);
stopRecordingButton.addEventListener('click', stopHandler);

initDB();
initCamera();
