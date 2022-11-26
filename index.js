const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
// .env file Read
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// Database Connected

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bugesq5.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


//Testing server path
app.get('/', (req, res)=>{
    res.send('Car server Running')
})

// Running Port
app.listen(port, ()=>{
    console.log('Car server Running on port', port);
})