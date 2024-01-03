const video = document.getElementById('video');
const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
let mediaRecorder;
let recordedChunks = [];
let recordInterval;

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
            
            // Save Blob Locally
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Upload to Firebase
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
    }, 8000); // stop recording after 15 seconds
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

initCamera();
