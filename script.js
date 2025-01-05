// TODO: Replace with your own Client ID and API Key from the Google Cloud Console
const CLIENT_ID = '691057096384-74gruqqkglv1urlp8f96vlfib22asrap.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load Google API client library
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Initialize the Google API client
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Initialize Google Identity Services
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Callback defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

// Enable buttons once APIs are loaded
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

// Handle authorization
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('authorize_button').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

// Upload file to Google Drive
async function uploadFile() {
    const fileInput = document.getElementById('file_input');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const metadata = {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
    };

    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
            body: form,
        });
        const result = await response.json();
        alert('File uploaded successfully. File ID: ' + result.id);
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred while uploading the file.');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upload_button').addEventListener('click', uploadFile);
});
