const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//JSON web token
const jwt = require('jsonwebtoken');

// .env file Read
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

//Jwt token veryfy middleware
function veryfyToken(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(404).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'})
        }
        req.decoded = decoded;
        next()
    })
}

// Database Connected
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bugesq5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categoryCollection = client.db('cars').collection('carCategories');
        const carsCollection = client.db('cars').collection('carsCollections');
        const bookingCars = client.db('cars').collection('bookingCollection');
        const userCollection = client.db('cars').collection('users');
        const productCollection = client.db('cars').collection('addProductCollection');
        const advertiseCollection = client.db('cars').collection('addvertiseProductCollection');

        //veryfy admin
        const verifyAdmin = async(req, res, next)=>{
            const decodedEmail = req.decoded.email;
            const query = {email : decodedEmail};
            const user = await userCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'Forbidden access'})
            }
            next();
        }

        //veryfy buyer
        const verifyBuyer = async(req, res, next)=>{
            const decodedEmail = req.decoded.email;
            const query = {email : decodedEmail};
            const user = await userCollection.findOne(query);
            if(user?.role !== 'buyer'){
                return res.status(403).send({message: 'Forbidden access'})
            }
            next();
        }

        //veryfy seller
        const verifySeller = async(req, res, next)=>{
            const decodedEmail = req.decoded.email;
            const query = {email : decodedEmail};
            const user = await userCollection.findOne(query);
            if(user?.role !== 'seller'){
                return res.status(403).send({message: 'Forbidden access'})
            }
            next();
        }


        //access JWT Token
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email:email};
            const user = await userCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'10h'});
                res.send({accessToken: token})
            }
            else{
                res.status(403).send({accessToken:''})
            }
        })

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

        // booking cars post
        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            const query = {
                username : booking.username,
                userEmail : booking.userEmail,
                itemName : booking.itemName
            }
            const alreadyBooked = await bookingCars.find(query).toArray();
            if(alreadyBooked.length){
                const message = 'You have already booking This Car';
                return res.send({acknowledged:false, message})
            }
            const result = await bookingCars.insertOne(booking);
            res.send(result);
        })

        // my booking / my order Get
        app.get('/bookings', async(req, res)=>{ // ekhane veryfiyTOken ta hobe kintu
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if(email !== decodedEmail){
            //     return res.status(403).send({message:'Forbidden Access'})
            // }
            const query = {userEmail: email};
            const result = await bookingCars.find(query).toArray();
            res.send(result)
        })
        
        //All users get from database
        app.get('/users', async(req, res)=>{
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })

        // All users set database
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)

        })

        // social users set database
        app.put('/users', async(req, res)=>{
            const user = req.body;
            const options = {upsert: true}
            const updateDoc = {
                $set:{
                    role: 'buyer'
                }
            }
            const result = await userCollection.updateOne(user, updateDoc, options);
            res.send(result)
        })

        // Admin check
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        })

        //Buyers check
        app.get('/users/buyers/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            res.send({isBuyer: user?.role === 'buyer'});
        })

        //Seller check
        app.get('/users/seller/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            res.send({isSeller: user?.role === 'seller'});
        })
        
        // all buyers
        app.get('/buyers', async(req, res)=>{
            const query = {role:'buyer'};
            const result = await userCollection.find(query).toArray();
            res.send(result)
        })

        // all sellers
        app.get('/sellers', async(req, res)=>{
            const query = {role:'seller'};
            const result = await userCollection.find(query).toArray();
            res.send(result)
        })

        // add product
        app.post('/addproducts', async(req, res)=>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        })

        // get product
        app.get('/addproducts', async(req, res)=>{
            const query = {};
            const product = await productCollection.find(query).toArray();
            res.send(product)
        })

        // delete product
        app.delete('/addproducts/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        })

        //add addAdvertise
        app.post('/addadvertise', async(req, res)=>{
            const advertise = req.body;
            const result = await advertiseCollection.insertOne(advertise);
            res.send(result)
        })

        // get AddAdvertise

        app.get('/addadvertise', async(req, res)=>{
            const query = {};
            const result = await advertiseCollection.find(query).toArray();
            res.send(result)
        })

        // admin seller delete
        app.delete('/seller/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = {_id : ObjectId(id)};
            const result = await userCollection.deleteOne(filter);
            res.send(result)
        })

        // admin buyer delete
        app.delete('/buyer/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = {_id : ObjectId(id)};
            const result = await userCollection.deleteOne(filter);
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