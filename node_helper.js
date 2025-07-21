const NodeHelper = require("node_helper");
const fs = require("fs");
const { exec, execSync } = require("child_process");

function wifiConfigExists() {
  const path = "/etc/wpa_supplicant/wpa_supplicant.conf";
  if (!fs.existsSync(path)) return false;

  const content = fs.readFileSync(path, "utf8");
  return content.includes("network={") && content.includes("ssid=");
}

function isConnected() {
  try {
    const result = execSync("iwgetid -r").toString().trim();
    return result.length > 0;
  } catch {
    return false;
  }
}

module.exports = NodeHelper.create({
  start: function () {
    console.log("[wifi-setup] Node helper loaded");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_SETUP") {
      const hasWifi = wifiConfigExists();
      const connected = isConnected();

      console.log(`[wifi-setup] Wifi config exists: ${hasWifi}`);
      console.log(`[wifi-setup] Is connected: ${connected}`);

      if (!hasWifi || !connected) {
        console.log("[wifi-setup] Starting setup sequence...");
        this.startAccessPoint();
        this.launchWifiServer();
      } else {
        console.log("[wifi-setup] Wi-Fi already configured and connected. Skipping setup.");
        this.sendSocketNotification("SETUP_SKIPPED");
      }
    }
  },

  startAccessPoint: function () {
    exec("sudo systemctl start hostapd && sudo systemctl start dnsmasq", (error, stdout, stderr) => {
      if (error) {
        console.error(`[wifi-setup] Failed to start AP: ${error.message}`);
      } else {
        console.log("[wifi-setup] Access Point started");
      }
    });
  },

  launchWifiServer: function () {
    const server = require("./wifi-server/server");
    server.init((status) => {
      if (status === "success") {
        this.sendSocketNotification("SETUP_COMPLETE");
      } else {
        this.sendSocketNotification("SETUP_FAILED");
      }
    });
  }
});
