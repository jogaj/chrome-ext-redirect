import { IP_TO_MATCH, REDIRECT_URL, CHK_ONE_INSTANCE } from './shared.js';

const newTabs = new Set();
let browser = null;
let isEdge = false;

function getBrowserSystemPageURL(extensionPageUrl) {
  return isEdge ? extensionPageUrl.replace('chrome-extension', 'extension') : extensionPageUrl;
}

chrome.tabs.onCreated.addListener((tab) => {
  isEdge = navigator.userAgentData.brands.some(item => item.brand === 'Microsoft Edge'); 
  browser = isEdge ? 'edge' : 'chrome';

  // A tab is considered a "new tab" if it's user-initiated (no opener)
  // or if it's explicitly opening the "new tab page". This handles
  // inconsistencies with `openerTabId` in incognito mode where it can sometimes
  // be set even for user-created tabs (Ctrl+T).
  const isNewTab = tab.openerTabId === undefined || tab.pendingUrl === `${browser}://newtab/`;

  if (isNewTab) {
    newTabs.add(tab.id);
    // For incognito to dispatch onUpdated event
    if (tab.incognito) {
      chrome.tabs.update(tab.id, {
        url: `${browser}://newtab/`
      });
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, updatedTab) => {
  // Only act on newly created tabs that have finished loading.
  if (!newTabs.has(tabId) || changeInfo.status !== 'complete') {
    return;
  }

  // The tab has loaded, we can remove it from our set so we don't act on it again.
  newTabs.delete(tabId);

  const data = await chrome.storage.sync.get([IP_TO_MATCH, REDIRECT_URL, CHK_ONE_INSTANCE]);

  const ipToMatch = data[IP_TO_MATCH];
  const redirectUrl = data[REDIRECT_URL];
  const oneInstance = data[CHK_ONE_INSTANCE];

  const systemPages = [
    getBrowserSystemPageURL(chrome.runtime.getURL('pages/options/options.html')),
    getBrowserSystemPageURL(chrome.runtime.getURL('pages/redirect/redirect.html'))
  ];

  if (redirectUrl) {
    systemPages.push(redirectUrl);
  }

  const extensionPage = isEdge ? 'extension' : 'chrome-extension';
  const isBrowserConfigPage = (updatedTab.url.startsWith(`${browser}://`) || updatedTab.url.startsWith(`${extensionPage}://`)) && updatedTab.url !== `${browser}://newtab/`;

  // Do not redirect when a configuration chrome page is opened
  if (isBrowserConfigPage) {
    return;
  }

  // Do not redirect if the page is one of the extension's pages
  if (systemPages.some(sysPage => updatedTab.url.includes(sysPage))) {
    return;
  }

  // Get tabs
  const currentTabs = await chrome.tabs.query({ currentWindow: true });

  // This is to not redirect multiple times to the options.html page
  const isExtensionOptionsPage = updatedTab.url === systemPages[0];
  
  // if the redirect url already exists in an opened tab then exit
  if (!isExtensionOptionsPage && oneInstance && currentTabs.some(tab => tab.url.includes(redirectUrl))) {
    return;
  }

  // if not ip configured or redirectUrl and if the current url is not the options page of the extension
  // then redirect to the options page
  if ((!ipToMatch || !redirectUrl) && !isExtensionOptionsPage) {
    chrome.tabs.update(tabId, { url: systemPages[0] });
  } else if (ipToMatch && redirectUrl) {
    // if ip and redirectUrl are configured
    try {
      const response = await fetch('http://ip-api.com/json');
      const ipData = await response.json();
      if (ipData.query === ipToMatch) {
        // show the redirecting page
        chrome.tabs.update(tabId, { url: systemPages[1] });
        setTimeout(() => {
          // and then redirect to redirectUrl
          chrome.tabs.update(tabId, { url: redirectUrl });
        }, 1500);
      }
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  // Clean up the set if a tab is closed before it's processed.
  newTabs.delete(tabId);
});
