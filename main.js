const video = document.getElementById('video');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
let mediaRecorder;
let recordedChunks = [];
let recordInterval;

// Define the name of your IndexedDB and the object store
const dbName = 'videoDB';
const storeName = 'videos';

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open(dbName);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onerror = (event) => {
        console.error('Could not open IndexedDB:', event.target.errorCode);
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
            storeInIDB(blob);
            uploadToFirebase(blob);
            if (!stopRecordingButton.disabled) {
                startNewRecording();
            }
        };

        startRecordingButton.disabled = false;
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

function startNewRecording() {
    mediaRecorder.start();
    recordInterval = setTimeout(() => {
        mediaRecorder.stop();
    }, 8000); // 8 seconds
}

// Function to store video blob in IndexedDB
function storeInIDB(blob) {
    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add({ video: blob, timestamp: new Date() });
    };

    request.onerror = (event) => {
        console.error('Could not open IndexedDB:', event.target.errorCode);
    };
}

startRecordingButton.addEventListener('click', () => {
    startNewRecording();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
});

stopRecordingButton.addEventListener('click', () => {
    clearTimeout(recordInterval); // Clear the existing interval
    mediaRecorder.stop(); // Stop the current recording
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
});

initDB(); // Initialize the IndexedDB when the script loads
initCamera(); // Initialize the camera when the script loads
