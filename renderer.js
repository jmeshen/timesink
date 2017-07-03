// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer
const path = require('path')
// const Store = require('./store.js');
const Store = require('electron-store');

const store = new Store({
  configName: 'time-log',
  defaults: {
    sites: {
      netflix: 0,
      youtube: 0,
      buzzfeed: 0,
      facebook: 0
    }
  }
  // add a Today time spent counter?
});

console.log('sites from store: ', store.get('sites'))

let win

function loadWindow(site) {
  let startTime;
  win = new BrowserWindow({width: 1200, height: 800, show: false})
  win.loadURL(site.url)
  win.once('ready-to-show', () => {
    win.show()
    startTime = new Date()
  })
  win.on('close', () => {
    win = null;
    logTime(startTime, new Date(), site)
  })
}

function logTime(start, end, site) {
  let counterEl = document.getElementById(`${site.id}-time`)
  const siteToSet = `sites.${site.id}`;
  const timeSpent = Math.floor((end - start)/1000)
  const timeToSet = store.get('sites')[site.id] + timeSpent
  store.set(siteToSet, timeToSet)
  counterEl.innerText = timeHumanizer(timeToSet)
}

function timeHumanizer(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  }
  else if (seconds < 3600) {
    return `${Math.floor(seconds/60)}m ${seconds%60}s`
  } else {
    const hours = Math.floor(seconds/3600)
    let remaining = seconds - (hours * 3600)
    return `${hours}h ${Math.floor(remaining/60)}m ${remaining%60}s`
  }
}

const siteMap = {
  netflix: {
    id: 'netflix',
    url: 'https://netflix.com'
  },
  youtube: {
    id: 'youtube',
    url: 'https://youtube.com'
  },
  buzzfeed: {
    id: 'buzzfeed',
    url: 'https://buzzfeed.com'
  },
  facebook: {
    id: 'facebook',
    url: 'https://facebook.com'
  }
}

Object.keys(siteMap).forEach(site => {
  document.getElementById(site).addEventListener('click', (event) => {
    loadWindow(siteMap[site])
  })
  const ctrEl = document.getElementById(`${site}-time`)
  ctrEl.innerText = timeHumanizer(store.get('sites')[site])
})

document.getElementById('add-site').addEventListener('click', () => {
  console.log('herro')
  ipc.send('asynchronous-message', 'ping')
  // win.loadURL('https://google.com')
})

ipc.on('asynchronous-reply', function (event, arg) {
  const message = `Asynchronous message reply: ${arg}`
  console.log(message)
})
