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

async function run(){
    try{
        const categoryCollection = client.db('cars').collection('carCategories');
        const carsCollection = client.db('cars').collection('carsCollections');
        //get categories
        app.get('/categories', async(req, res)=>{
            const query = {};
            const options = await categoryCollection.find(query).toArray();
            res.send(options)
        })

        // Getting Cars
        app.get('/category/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {CategoryId:id};
            const result = await carsCollection.find(query).toArray();
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(console.log())


//Testing server path
app.get('/', (req, res)=>{
    res.send('Car server Running')
})

// Running Port
app.listen(port, ()=>{
    console.log('Car server Running on port', port);
})