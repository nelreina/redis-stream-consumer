const day = require("dayjs");

exports.getDate = (format) => day().format(format);
exports.getTimeStamp = () => day().format("YYYY-MM-DDTHH:mm:ss.SSS");
exports.today = () => day().format("YYYY-MM-DD");
