const cheerio = require("cheerio");
const fs = require('fs');
const infoJSON = JSON.parse(fs.readFileSync('./info.json', 'utf8'));

const init = async () => {
    const getLink = (URL, keyword, page, resultsPerPage) => { // Generates the PEARL link based on query (keyword) and page number
        const query = keyword.replace(/\s/g, '+')
        return(`${URL}/discover?rpp=${resultsPerPage}&etal=0&query=${query}&group_by=none&page=${page}`);
    }
    let i = 0;
    for (const URL of infoJSON.URLs) {
        let csvList = []; // The array used to store all lines of the CSV file to be created
        const universityName = infoJSON.uniNames[i];
        for (const keyword of infoJSON.keywords) {
            console.log(`Currently scraping keyword: ${keyword}, University: ${universityName}`)
            for (let i = 0; i <= 1; i++){ //Put up to 1 pages for now, can increase if you wish.
                const link = getLink(URL, keyword, i, 100)
                const response = await fetch(link)
                const body = await response.text();
                const $ = cheerio.load(body);

                $('.artifact-description').map((i, elem) => { // Looks for Div with class artifact-description which holds the key info to scrape
                    const titleNode = $(elem).find('a')
                    const infoNode = $(elem).find('.artifact-info')

                    const artifact = { // Object representing the current artifact/research
                        title: '',
                        href: '',
                        author: '',
                        date: '',
                        abstract: '',
                        keyword,
                    };

                    // Below assigns all the relevant content from the Div to artifact object
                    artifact.title = (titleNode.text())
                    artifact.title = (artifact.title).replace(/\r?\n|\r/g, " "); //remove new line
                    artifact.href = titleNode.attr('href')
                    artifact.author =  infoNode.find('.author').text();
                    artifact.date = infoNode.find('.publisher-date').text();
                    artifact.abstract = infoNode.find('.abstract').text();
                    artifact.abstract = (artifact.abstract).replace(/\r?\n|\r/g, " "); //remove new line

                    let csvString = '';

                    for (const [key, value] of Object.entries(artifact)) { // Loops throught the artifact object and generates a CSV string using '_' delimiter
                        if (key === 'title') {
                            csvString += value;
                        } else {
                            csvString += `_${value}`;
                        }
                    }

                    csvList.push(csvString) // Pushes csvString to the array of csvStrings (csvList)
                });
            };

            csvList = csvList.filter(function(elem, pos) { // Removes potential duplicates where the same artifact showed on multiple pages
                return csvList.indexOf(elem) == pos;
            });
        }

        const file = fs.createWriteStream(`${universityName}.csv`); // Creates the file to store the scraped research info
        file.on('error', function(err) { throw err });
        file.write('sep=_\n'); // Specifies '_' delimiter
        file.write('Title_Href_Author_Date_Abstract_Keyword\n'); // Adds Titles to each row in the CSV
        for (const item of csvList) { // Writes the array to the CSV
            file.write(`${item}\n`);
        }
        file.end();
        i += 1;
    }

}

init();
