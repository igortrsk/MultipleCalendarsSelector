'use strict';

const currentPackageVersion = chrome.runtime.getManifest().version;
const storageIdForLastSeenPackageVersion = "lastSeenPackageVersion";

let tracker;

function main() {
  chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({ url: googleCalendarUrl });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: ''},
        })],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });
  
  tracker = getAnalyticsTracker();
  tracker.sendAppView('BackgroundView');
  tracker.sendEvent('Background', 'Extension version', currentPackageVersion);
  
  checkForVersionUpgrade();
}

function persistPackageVersion(versionToPersist, callback) {
  console.log("Persisting version " + versionToPersist);
  chrome.storage.sync.set({[storageIdForLastSeenPackageVersion]: versionToPersist}, callback);
}

function checkForVersionUpgrade() {
  chrome.storage.sync.get(storageIdForLastSeenPackageVersion, function(data) {
    const lastSeenPackageVersion = data[storageIdForLastSeenPackageVersion];
    if (lastSeenPackageVersion !== currentPackageVersion) {
      tracker.sendEvent('Extension upgrade detected from-to', lastSeenPackageVersion, currentPackageVersion);
      persistPackageVersion(currentPackageVersion);
    }
  });
}

main();
