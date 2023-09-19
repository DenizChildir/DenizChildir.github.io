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
            uploadToFirebase(blob);
            if (!stopRecordingButton.disabled) {
                startRecording();
            }
        };

        startRecordingButton.disabled = false;
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

function startRecording() {
    mediaRecorder.start();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    recordInterval = setTimeout(() => {
        mediaRecorder.stop();
    }, 60000); // stop recording after 1 minute
}

startRecordingButton.addEventListener('click', startRecording);

stopRecordingButton.addEventListener('click', () => {
    clearTimeout(recordInterval);
    mediaRecorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
    recordInterval = setTimeout(() => {
        mediaRecorder.stop();
    }, 120000); // stop recording after 2 minutes
});

initCamera();
