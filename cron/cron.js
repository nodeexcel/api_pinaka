var infusion_service = require("../service/infusion_service")
let CronJob = require("cron").CronJob;

module.exports = {
    updateAccessToken() {
        new CronJob("*/30 * * * *", function() {
            infusion_service.checkForUnauthorized()
        }, null, true);
    }
}