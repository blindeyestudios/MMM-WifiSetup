module.register("wifi-setup", {
    defaults: {},
    setupActive: true, // flag to determine whether to render anything

    start: function () {
        console.log("[wifi-setup] module loaded");
        this.sendSocketNotification("START_SETUP");
        this.status = "Setting up Access Point...";
    },

    getDom: function () {
        if (!this.setupActive) return document.createElement("div");

        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
            <div style="font-size: 1.2em; color: white;">
                ${this.status}
            </div>
        `;
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "SETUP_COMPLETE") {
            this.status = "Wi-Fi Setup Complete! Rebooting...";
            this.updateDom();
        }

        if (notification === "SETUP_FAILED") {
            this.status = "Wi-Fi Setup Failed!";
            this.updateDom();
        }

        if (notification === "SETUP_SKIPPED") {
            console.log("[wifi-setup] Skipping setup. Removing display.");
            this.setupActive = false;
            this.updateDom(); // triggers removal of rendered content
        }
    }
})