const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const path = require('path')
const cors = require('cors')
require('dotenv/config')

const usersRoute = require('./routes/api/users')

// Initialize app
const app = express()

// Setting up mongodb connection
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
  console.log("Connected to database...");
})
.catch(
  err => console.log(`Unable to connect to database ${err}`)
)


// Middleware
app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())
app.use(cors())

// Passport configuration
// app.use(passport.initialize())
require('./config/passport')(passport)



// Setting up the static directory
app.use(express.static(path.join(__dirname, 'public')))


// application routes
app.use('/api/users', usersRoute)

app.get('/', (req, res) => {
  res.send("Working")
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html')) 
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
})