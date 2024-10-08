const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const parseDate = (dateString) => {
    const parsedDate = dayjs(dateString, 'DD/MM/YYYY', true);

    // Strict parsing with custom format
    return parsedDate.isValid() ? parsedDate.toDate() : null;
};

module.exports = { parseDate };
