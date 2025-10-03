import { IP_TO_MATCH, REDIRECT_URL, CHK_ONE_INSTANCE } from '../../shared.js';

chrome.storage.sync.get([IP_TO_MATCH, REDIRECT_URL, CHK_ONE_INSTANCE], async (data) => {
    const ipToMatch = data[IP_TO_MATCH];
    let redirectUrl = data[REDIRECT_URL];
    const oneInstance = data[CHK_ONE_INSTANCE];

    // Check if only one instance is allowed
    const currentTabs = await chrome.tabs.query({currentWindow: true});
    const activeTab = currentTabs.find(tab => tab.active);

    // This is to do not redirect multiple times to the options.html page
    const isExtensionOptionsPage = window.location.href === chrome.runtime.getURL('pages/options/options.html');
    
    // if the url already exist in an existing tab then exit
    if (!isExtensionOptionsPage && !sessionStorage.getItem('redirected') && oneInstance && currentTabs.some(tab => tab.url.includes(redirectUrl))) {
        sessionStorage.setItem('redirected', 'true');
        chrome.tabs.update(activeTab.id, { url: "about:blank" });
        return;
    }

    setTimeout(() => {
        if ((!ipToMatch || !redirectUrl) && !isExtensionOptionsPage) {
            window.location.href = chrome.runtime.getURL('pages/options/options.html');
        }
        else if (ipToMatch && redirectUrl && !sessionStorage.getItem('redirected')) {
            fetch('http://ip-api.com/json').then(response => response.json()).then(data => {
                sessionStorage.setItem('redirected', 'true');
                if (data.query === ipToMatch) {
                    window.location.href = redirectUrl
                } else {
                    chrome.tabs.update(activeTab.id, { url: "about:blank" });
                }
            });
        }
    }, 1000);
});