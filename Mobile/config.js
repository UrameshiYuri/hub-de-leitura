module.exports = {
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
    logLevel: "warn",

    connectionRetryTimeout: 120000,
    connectionRetryCount: 0,

    capabilities: {
        platformName: "Android",
        browserName: "Chrome",

        "appium:automationName": "UiAutomator2",
        "appium:deviceName": "Android Emulator",
        "appium:udid": process.env.ANDROID_UDID || "emulator-5554",
        "appium:newCommandTimeout": 120,

        "wdio:enforceWebDriverClassic": true
    }
};