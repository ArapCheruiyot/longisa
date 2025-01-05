const CLIENT_ID = '691057096384-74gruqqkglv1urlp8f96vlfib22asrap.apps.googleusercontent.com'; // Replace with your client ID
const API_KEY = 'YOUR_API_KEY'; // Replace with your API key
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient;
let gapiLoaded = false;
let gisLoaded = false;

// Load Google API client
function gapiLoaded() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiLoaded = true;
        enableAuthorizeButton();
    });
}

// Load Google Identity Services client
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => handleAuthResponse(response),
    });
    gisLoaded = true;
    enableAuthorizeButton();
}

// Enable the "Authorize" button
function enableAuthorizeButton() {
    if (gapiLoaded && gisLoaded) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

// Handle authentication
function handleAuthResponse(response) {
    if (response.error) {
        console.error('Authentication failed:', response.error);
        alert('Authentication failed.');
        return;
    }
    document.getElementById('authorize_button').style.display = 'none';
    document.getElementById('upload_section').style.display = 'block';
}

// Trigger the OAuth flow
document.getElementById('authorize_button').onclick = () => {
    tokenClient.requestAccessToken();
};

// Upload file to Google Drive
document.getElementById('upload_button').onclick = async () => {
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
        alert(`File uploaded successfully! File ID: ${result.id}`);
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred while uploading the file.');
    }
};
