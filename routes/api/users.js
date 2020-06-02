const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const router = express.Router()
require('dotenv')

const User = require('../../model/User')
/**
 * @route POST api/users/register
 * @dec Register the user
 * @access Public
 */
router.post('/register', (req, res) => {
  let {
    name,
    username,
    email,
    password,
    confirmPassword
  } = req.body

  if (password !== confirmPassword) {
    return res.status(400).json({
      msg: 'Password must match'
    })
  }

  User.findOne({ username: username })
  .then((user)=> {
    if(user) {
      return res.status(400).json({
        msg: 'Username is already taken'
      })
    }
  })
  
  User.findOne({ email: email })
  .then((user)=> {
    if(user) {
      return res.status(400).json({
        msg: 'Email is already registered'
      })
    }
  })
  let newUser = new User({
    name,
    username,
    email,
    password
  })

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
        // Store hash in your password DB.
        if(err) throw err
        newUser.password = hash
        newUser.save()
        .then((user)=>{
          return res.status(201).json({
            success: true,
            msg: 'New user created',
            data: user
          })
        })
    });
  });
})

/**
 * @route POST api/users/register
 * @dec Register the user
 * @access Public
 */
router.post('/login', (req, res) => {

  User.findOne({ username: req.body.username })
  .then((user)=> {
    if(!user) {
      return res.status(404).json({
        msg: "Incorrect credential",
        success: false
      })
    }
    
    // Load hash from your password DB.
    bcrypt.compare(req.body.password, user.password)
    .then(isMatch => {
      if(isMatch){
        // generate user auth token
        const payload = {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email
        }
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 604800}, (err, token) => {
          res.status(200).json(
          { success: true,
            token: `Bearer ${token}`,
            user: user,
            msg: "You are now logged on"
          }
         )
        })
      } else {
        res.status(400).json({
          msg: 'Incorrect credential',
          success: false
        })
      }
    });
    
  })
})

/**
 * @route POST api/users/register
 * @dec Return users data
 * @access Private
 */

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user)
})

module.exports = router