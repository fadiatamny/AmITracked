chrome.storage.local.get(['sites'], function (result) {
  process(result.sites);
});

/**
 * a function to go initialize and insert site data.
 * go over scripts in current page and add the site to the history of each tracker domain we track.
 * 
 * @param {object} sites - holds the sites data that is stored in the extention storage.
*/
const process = (sites) => {
  if (!sites)
    sites = [
      { name: 'Facebook', trackerDomain: 'facebook.net', history: [] },
      { name: 'Google Analytics', trackerDomain: 'google-analytics.com', history: [] },
      { name: 'Twitter', trackerDomain: 'ads-twitter.com', history: [] },
      { name: 'DoubleClick', trackerDomain: 'doubleclick.net', history: [] },
      { name: 'Amazon', trackerDomain: 'amazon-adsystem.com', history: [] },
    ];
  else
    sites = JSON.parse(sites);

  let hostname = new URL(location.href).hostname;

  const scripts = document.querySelectorAll('script');
  scripts.forEach(element => {
    sites.forEach(site => {
      if (element.innerText.includes(site.trackerDomain)) {
        if (!site.history.includes(hostname))
          site.history.push(hostname);
      }
    });
  });
  chrome.storage.local.set({ sites: JSON.stringify(sites) });
}