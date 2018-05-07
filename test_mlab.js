const axios = require('axios');

let client = axios.create({
  baseURL: 'https://api.mlab.com/api/1/databases/mydb_al317217/collections?apiKey=peq0cFkkGOCDWwrz1cMyyunvh8tVoiQb',
  timeout: 1000,
});

client.get("/datasets")
      .then(response => console.log(response.data))
      .catch(error => console.log(error));

