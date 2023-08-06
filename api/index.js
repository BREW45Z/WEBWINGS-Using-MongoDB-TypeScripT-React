const express =require('express');
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();
const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();

PORT = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'}));//origin is frontend url

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})

app.get('/test', (req,res)=>{
    res.status(200).json({success:true})
})

app.post('/register', async (req,res)=>{
    try {
        const {name, email, password} = req.body;
        const user = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        })

        res.json(user)
        
    } catch (error) {
        res.status(500).json({success:false, message:error.message})//status:422- unprocessable entity(e)
        
    }
})

app.post('/login', async (req,res)=>{
    const {email, password} = req.body;
    const user = User.findOne({email});
    //if user doesn't exist in database throw error
    if(!user){
        res.status(422).json({success:false, message:'Invalid credentials'})
    }
    //if user exists, check if password is correct
    if(bcrypt.compareSync(password, user.password)){
        jwt.sign({email:user.email, id:user._id}, process.env.SECRET_KEY, {expiresIn:'10d'}, (err, token)=>{
            if(err){
                res.status(500).json({success:false, message:'Error signing token'})
            }
            res.cookie('token', token).json(user)
        })
}})


app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT} ....`);

})