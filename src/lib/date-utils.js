import day from "dayjs";

export const getDate = (format) => day().format(format);
export const getTimeStamp = () => day().format("YYYY-MM-DDTHH:mm:ss.SSS");
export const today = () => day().format("YYYY-MM-DD");
