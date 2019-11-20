const cheerio = require("cheerio");
const fs = require("fs");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: "out.csv",
  header: [
    { id: "name", title: "Name" },
    { id: "totalRevenue", title: "Total Revenue" },
    { id: "grossReceipts", title: "Gross Receipts" },
    { id: "assets", title: "Assets" },
    { id: "state", title: "State" },
    { id: "city", title: "City" },
    { id: "EIN", title: "EIN" }
  ]
});

(() => {
  const $ = cheerio.load(fs.readFileSync("./body.html"));
  const orgResults = $(`.orgResults`);
  const resultsPerPage = $(orgResults)
    .map((i, el) => $(el).find(`.row.search-result-row.no-padding`))
    .get();
  // const sections = [].concat.apply([], orgResults);

  let results = [];

  $(resultsPerPage).each((i, section) => {
    $(section).each((i, el) => {
      const orgInfo = $(el)
        .find(`.org-info`)
        .text()
        .split("|");

      const finValues = $(el).find(
        `.financial-data.no-padding-left .fin-value`
      );

      results.push({
        name: $(el)
          .find(`.search-org-name`)
          .text(),
        grossReceipts: $(finValues[0]).text(),
        assets: $(finValues[1]).text(),
        // url:
        // address: orgInfo[0].trim(),
        state: orgInfo[0].split(",")[1].trim(),
        city: orgInfo[0].split(",")[0].trim(),
        EIN: orgInfo[1].trim()
      });
    });
  });

  csvWriter
    .writeRecords(results)
    .then(() => console.log("The CSV file was written successfully"));

  console.log(results);
})();
