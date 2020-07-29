

/**
 * builds a list of trackers foreach trakcer domain
 * @param {string} name - the name of the tracker
 * @param {string[]} sites - holds the sites that the tracker was active on.
 * @returns {HTMLElement} Dropdown div 
*/
const generateDropDown = (name, sites) => {
  const sitesDiv = document.createElement('div');
  sitesDiv.setAttribute('class', 'dropdown-content');
  sitesDiv.setAttribute('id', `${name}`);
  sites.forEach(site => {
    const a = document.createElement('a');
    a.href = site;
    a.innerText = site;
    a.target = '_blank'
    sitesDiv.appendChild(a);
  });

  const handleClick = () => {
    closeDropDowns();
    document.getElementById(`${name}`).classList.toggle('show');
  };

  const button = document.createElement('button');
  button.onclick = handleClick;
  button.setAttribute('class', 'dropbtn');
  button.innerText = name;

  const div = document.createElement('div');
  div.setAttribute('class', 'dropdownDiv');
  div.appendChild(button);
  div.appendChild(sitesDiv);

  return div;
};

/**
 * builds a list of trackers foreach trakcer domain
 * 
 * @param {string[]} trackers - holds the domains of the trackers that are active on this site.
 * @returns {void} Nothing
*/
const generateActiveList = (trackers) => {
  const elem = document.getElementById('currentTrackersHeader');
  elem.innerText = 'Youre Currently Tracked By:';

  const div = document.getElementById('currentTrackers');

  const sitesDiv = document.createElement('div');
  sitesDiv.setAttribute('class', 'currentTrackersList');
  trackers.forEach(site => {
    const p = document.createElement('p');
    p.innerHTML = site;
    sitesDiv.appendChild(p);
  });

  div.appendChild(sitesDiv);
};


/**
 * checks for trackers in current site and notifies it.
 * 
 * @param {string[]} sites - holds the domains of the trackers.
 * @returns {void} Nothing
*/
const fetchCurrentSiteTrackers = (sites) => {
  const fetchDom = () => {
    return { head: document.head.innerHTML, body: document.body.innerHTML };
  }

  let hostname = '';
  let trackers = [];
  //fetch current tab's website hostname.
  chrome.tabs.query({ 'active': true, currentWindow: true }, (tabs) => hostname = new URL(tabs[0].url).hostname);

  //execute script to itterate over the site looking for tracking pixels. ( will run only on active tab since its the only permission)
  chrome.tabs.executeScript({
    code: '(' + fetchDom + ')();'
  }, (result) => {
    //Here we have just the html and not DOM structure so we parse it to a dom object and search for script tags.
    const head = new DOMParser().parseFromString(result[0].head, 'text/html');
    const body = new DOMParser().parseFromString(result[0].body, 'text/html');
    const scripts = [...head.head.querySelectorAll('script'), ...body.body.querySelectorAll('script')];
    scripts.forEach(element => {
      sites.forEach(site => { //check if the current script tag meets any of the included trackers we are looking for.
        if (element.innerText.includes(site.trackerDomain)) {
          console.log(site.name);
          if (!trackers.includes(site.name))
            trackers.push(site.name);
        }

      });
    });

    if (trackers.length !== 0)
      generateActiveList(trackers);
  });
};

/**
 * handles reading from storage to see previously visited sites with trackers
 * 
 * @param {object} sites - holds the sites data that is stored in the extention storage.
 * @returns {void} Nothing
*/
const handleLoading = (sites) => {
  if (sites) {
    sites = JSON.parse(sites);
    const div = document.getElementById('trackersHistory');
    sites.forEach(elem => {
      const siteDiv = generateDropDown(elem.name, elem.history);
      div.appendChild(siteDiv);
    });
    fetchCurrentSiteTrackers(sites);
  }
};

window.onload = () => {
  chrome.storage.local.get(['sites'], res => handleLoading(res.sites));
};


const closeDropDowns = () => {
  const dropdowns = document.getElementsByClassName('dropdown-content');
  for (let i = 0; i < dropdowns.length; i++) {
    if (dropdowns[i].classList.contains('show')) {
      dropdowns[i].classList.remove('show');
    }
  }
}

//when clicking away from a dropdown then it collapses all the dropdowns
window.onclick = (event) => {
  if (!event.target.matches('.dropbtn')) {
    closeDropDowns();
  }
}