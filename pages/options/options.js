import { SAVE_BTN, STATUS, STATUS_ICON, STATUS_CONTAINER, STATUS_MESSAGE, FORM, IP_TO_MATCH, REDIRECT_URL } from '../../shared.js';

const REGEXP_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const REGEXP_URL = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

document.getElementById(STATUS_ICON).addEventListener('click', () => {
    const statusContainer = document.getElementById(STATUS_CONTAINER);
    statusContainer.classList.add('hidden');
});

document.getElementById(SAVE_BTN).addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.forms[FORM];
    const status = document.getElementById(STATUS);
    const statusMessage = document.getElementById(STATUS_MESSAGE);
    const statusContainer = document.getElementById(STATUS_CONTAINER);
    statusContainer.classList.remove('hidden');
    if (form.checkValidity() && isValid(IP_TO_MATCH, REGEXP_IP) && isValid(REDIRECT_URL, REGEXP_URL)) {
        const ipToMatch = document.getElementById(IP_TO_MATCH).value;
        const redirectUrl = document.getElementById(REDIRECT_URL).value;
        chrome.storage.sync.set({ ipToMatch, redirectUrl }, () => {
            statusMessage.textContent = 'Settings saved successfully.';
            status.classList.add('success');
            status.classList.remove('error');
            setTimeout(() => {
                statusContainer.classList.add('hidden')
            }, 3000);
        });
    } else {
        statusMessage.textContent = 'Settings save failed. Please check the fields.';
        status.classList.remove('success');
        status.classList.add('error');
    }
});

chrome.storage.sync.get([IP_TO_MATCH, REDIRECT_URL], (data) => {
    document.getElementById(IP_TO_MATCH).value = data[IP_TO_MATCH] ?? '';
    document.getElementById(REDIRECT_URL).value = data[REDIRECT_URL] ?? '';
});

function isValid(fieldId, regExp) {
    return new RegExp(regExp).test(document.getElementById(fieldId).value);
}
