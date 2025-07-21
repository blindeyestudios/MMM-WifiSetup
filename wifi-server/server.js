module.exports = {
  init: (onResult) => {
    app.post("/connect", async (req, res) => {
      const { ssid, password } = req.body;

      if (!ssid || !password) {
        res.status(400).json({ error: "Missing SSID or password" });
        return onResult?.("fail");
      }

      try {
        await writeWifiConfig(ssid, password);
        res.json({ success: true });

        onResult?.("success");

        setTimeout(() => {
          console.log("[wifi-setup] Rebooting to apply Wi-Fi settings...");
          require("child_process").exec("sudo reboot");
        }, 2000);
      } catch (err) {
        console.error("[wifi-setup] Error writing config:", err);
        res.status(500).json({ error: "Failed to write Wi-Fi config" });
        onResult?.("fail");
      }
    });

    app.listen(PORT, () => {
      console.log(`[wifi-setup] Listening for Wi-Fi credentials on port ${PORT}`);
    });
  }
};