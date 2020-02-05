const fetch = require('node-fetch')
const parseString = require('xml2js').parseStringPromise;
const moment = require('moment')

const rssUrl = `https://drhoffman.com/podcast/feed/intelligent-medicine/`

function readStream(stream, encoding = "utf8") {
    
  stream.setEncoding(encoding);

  return new Promise((resolve, reject) => {
      let data = "";
      
      stream.on("data", chunk => data += chunk);
      stream.on("end", () => resolve(data));
      stream.on("error", error => reject(error));
  });
}

const byPubDate = (a, b) => {
  const aPubDate = moment(a.pubDate)
  const bPubDate = moment(b.pubDate)
  if (aPubDate.isSame(bPubDate)) return 0
  return aPubDate.isBefore(bPubDate) ? 1 : -1
}

const parseRss = async (rssUrl, numEntries) => {
  const data = await fetch(rssUrl);
  const xml = await readStream(data.body)
  const json = await parseString(xml)
  const retval = json.rss.channel[0].item
    .map(
      i => {
        return Object.keys(i)
          .reduce(
            (acc, key) => {
              return {
                ...acc,
                [key]: i[key][0]
              }

            }, {}
          )
      }
    )
    .sort(byPubDate)
    .slice(0,numEntries)

    console.log(retval)
    return retval
}

parseRss(rssUrl, 3)