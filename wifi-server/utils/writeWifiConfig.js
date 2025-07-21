const fs = require("fs");
const path = "/etc/wpa_supplicant/wpa_supplicant.conf";

function writeWifiConfig(ssid, password) {
    return new Promise((resolve, reject) => {
        const content = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
    ssid="${ssid}"
    psk="${password}"
    key_mgmt=WPA-PSK
}
`;

        fs.writeFile(path, content, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { writeWifiConfig };