const path = require("path");
const osu = require("node-os-utils");
const { ipcRenderer } = require("electron");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverLoad;
let alertFrequency;

// Get settings

ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverLoad = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

// Run every 2 seconds

setInterval(() => {
  // CPU usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";

    document.getElementById("cpu-progress").style.width = info + "%";

    // Make progress bar red if overloaded
    if (info > cpuOverLoad) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    // Check Overload
    if (info >= cpuOverLoad && runNotify(alertFrequency)) {
      notifyUser({
        title: "CPU Overload",
        body: `CPU is over ${cpuOverLoad}%`,
        icon: path.join(__dirname, "img", "icon.png"),
      });

      localStorage.setItem("lastNotify", +new Date());
    }
  });

  //   CPU Free
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });

  // Uptime
  document.getElementById("sys-uptime").innerText = secondsToDHMS(os.uptime());
}, 2000);

// Set Model
document.getElementById("cpu-model").innerText = cpu.model();

// computer Name
document.getElementById("comp-name").innerText = os.hostname();

// OS
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Total Memory
mem
  .info()
  .then(
    (info) => (document.getElementById("mem-total").innerText = info.totalMemMb)
  );

//   Show days, hours, mins, sec

function secondsToDHMS(sec) {
  sec = +sec; //Converts to Number type

  const d = Math.floor(sec / (3600 * 24));
  const h = Math.floor((sec % (3600 * 24)) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// Send Notifications

function notifyUser(options) {
  new Notification(options.title, options);
}

// Check how much time has passed since notification
function runNotify(frequency) {
  if (localStorage.getItem("lastNotify") === null) {
    // Store Timestamp
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}
