const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./UI/tests",

    fullyParallel: false,
    workers: 1,
    retries: 0,

    timeout: 30000,

    expect: {
        timeout: 5000
    },

    reporter: [
        ["list"],
        ["html", {
            outputFolder: "relatorios/ui",
            open: "never"
        }]
    ],

    outputDir: "test-results/ui",

    use: {
        baseURL: "http://localhost:3000",
        browserName: "chromium",
        headless: true,
        viewport: {
            width: 1280,
            height: 720
        },
        screenshot: "only-on-failure",
        trace: "retain-on-failure"
    }
});