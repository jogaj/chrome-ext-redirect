import { IP_TO_MATCH, REDIRECT_URL } from '../../shared.js';

chrome.storage.sync.get([IP_TO_MATCH, REDIRECT_URL], (data) => {
    const ipToMatch = data[IP_TO_MATCH];
    let redirectUrl = data[REDIRECT_URL];
    // This is to do not redirect multiple times to the options.html page
    const isExtensionOptionsPage = window.location.href === chrome.runtime.getURL('pages/options/options.html');

    setTimeout(() => {
        if ((!ipToMatch || !redirectUrl) && !isExtensionOptionsPage) {
            window.location.href = chrome.runtime.getURL('pages/options/options.html');
        }
        else if (ipToMatch && redirectUrl && !sessionStorage.getItem('redirected')) {
            fetch('http://ip-api.com/json').then(response => response.json()).then(data => {
                if (data.query === ipToMatch) {
                    sessionStorage.setItem('redirected', 'true');
                    window.location.href = redirectUrl
                }
            });
        }
    }, 1000);
});