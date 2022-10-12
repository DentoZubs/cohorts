require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const app = express();
const port = process.env.APP_PORT

app.use(bodyParser.json())


app.listen(port, () => {

    console.log(`applicants api is listening on port ${port}`)
    
})

const connection = mysql.createConnection({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  password:process.env.DATABASE_PASSWORD,
  database:process.env.DATABASE_NAME,
  port:process.env.DATABASE_PORT
});

connection.connect();



app.post('/create', (req, res) => {  
    const { firstname, othernames, email, phone_number, address } = req.body

    const schema = Joi.object({
        firstname: Joi.string().min(4).max(30).required(),
        othernames: Joi.string().min(4).max(30).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','ng', 'org', 'uk' ] } }).required(),
        phone_number: Joi.string().min(11).max(15).required(),
        address: Joi.string().min(12).max(70).required()
    })
    

    try {
        const { error, value }= schema.validate(req.body);
    
    if (error != undefined) {
        throw new Error(error.details[0].message)
    }

        connection.query(
            `select * from applicants where email=${email} or phone=${phone_number}`,
            (err, results, fields) => {
                if (err) {
                    // console.log("1: error: ", err)
                     throw new Error('Please check back, this is on us.')
    
                }
         
                if (results.length > 0) {
                    throw new Error ('The email/Phone_number exists.', 400)
                }


                //create the customer 
                connection.query(
                    `insert into applicants(id,firstname, othernames, phone_number, email, address)
                 values('${uuidv4()}','${firstname}','${othernames}','${phone_number}', '${email}', '${address} )`,
                    (err, results, fields) => {
                        if (err) {
                            // console.log("2: error: ", err)
                            throw new Error("This is on us, pleae try later")
                        }
                        res.status(201).json({
                            status:true,
                            message: "Account succesfully created",
                            data: req.body
                        })
                    }
                )}
        );
       
    } catch (e) {
        res.status(400).json({
            message: e.message
        })
    }

})
  



// connection.end()