const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api', async (req, res) => {
  const { songid } = req.query;

  if (!songid) {
    return res.status(400).json({ error: 'Song ID is empty!' });
  }

  try {
    const { data } = await axios.get(`https://api.allorigins.win/get?url=https%3A%2F%2Fwww.newgrounds.com%2Faudio%2Flisten%2F${songid}`);
    const { contents, status } = data;
    const code = status.http_code;

    if (code !== 200) {
      if (code === 404) {
        return res.status(404).json({ error: 'The song could not be found! Please check the song id and try again! (error 404)' });
      }
      return res.status(code).json({ error: `Something went wrong! Error Code: ${code}` });
    }

    // Scrape the site data
    let url = contents.substring(contents.indexOf("<![CDATA[")+9);
    url = url.substring(url.indexOf("embedController([")+17);
    url = url.substring(0, url.indexOf("\",\""));
    url = url.substring(0, url.indexOf("?"));
    url = url.substring(url.indexOf("url")+3);
    url = url.substring(url.indexOf(":\"")+2);
    url = url.replace(/\\\//g, "/");

    let title = contents.substring(contents.indexOf("<title>")+7);
    title = title.substring(0, title.lastIndexOf("</title>"));

    return res.json({ url, title });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'The song could not be found! Please check the song id and try again! (error 404)' });
    }
    return res.status(500).json({ error: 'Something went wrong! Please check your internet connection and try again!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
