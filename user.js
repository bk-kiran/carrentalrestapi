const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('./models/user')


// POST request to create a new user
router.post('/register', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'Email already exists... Please enter another one'
            }) 
        } else {
            bcrypt.hash( // using the bcrypt package to securely store the passwords in the database through hashing
            req.body.password, 10, (err, hash) => { // also using salting to increase further securit
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(), 
                        email: req.body.email,
                        password: hash
                    })
                    user
                    .save()
                    .then(result => {
                        console.log(result)
                        res.status(201).json({
                            message: 'New user created'
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            }) 

        }
    })
    .catch()

})



// POST request to authenticate a user (sign-in)
router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Authentication failed' 
            })
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => { // compares the plain text password and hashed password to see if they were both created with the same algorithm/key and hence identical regardless of hash
            if (err) {
                return res.status(401).json({
                    message: 'Authentication failed'
                })
            } 
            if (result) {
                const token = jwt.sign({    // using jsonwebtoken to create a token 
                    email: user[0].email,
                    userId: user[0]._id
                }, 'secret',   // creating a private key
                {
                    expiresIn: "1h"  // setting the expiration time for the private key
                })

                return res.status(200).json({
                    message: 'Authentication successful',
                    token: token
                })
            }
            res.status(401).json({
                message: 'Authentication failed'  // Same error messages to ensure reason behind failed authentication is not known
            })
        }) 
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})



// DELETE request to delete a particular user
router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId
    User.deleteOne({_id: id})
    .exec()
    .then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json(
                { message: 'User account deleted' 
            })
        } else {
            res.status(404).json(
                { message: 'No valid account found' 
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;