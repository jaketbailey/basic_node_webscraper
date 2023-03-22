# DSpace University Respository Web Scraper

- Start by running `npm install`
- To scrape the databases, enter `info.json` and add the relevant keywords you wish to scrape, the link to the research repository and the university name (names of output csv files)
- Run index.js with node (`node ./index.js`)
- The output file will be called `[uni_name].csv` and will be written to the root directory of the repository.
- Now works with all univeristy repositories created using DSpace