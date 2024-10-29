require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const app = express()
connectDB()

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST,DELETE,PUT'
}

app.use(cors(corsOptions))
const PORT = process.env.PORT

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', require('./routes/authRoutes'))
app.use('/categories', require('./routes/categoryRoutes'))
app.use('/books', require('./routes/bookRoutes'))
app.use('/author', require('./routes/authorRoutes'))
app.use('/publisher', require('./routes/publisherRoutes'))
app.use('/cart', require('./routes/cartRoutes'))
app.use('/order', require('./routes/orderRoutes'))
app.use('/reviews', require('./routes/reviewRoutes'))
app.use('/wishlist', require('./routes/wishlistRoutes'))

app.use(errorHandler)
app.use((req, res, next) => {
  if (req.user) {
    // assuming req.user is set after login
    req.cartId = req.user.id // use the user's ID for cart storage
  } else {
    if (!req.cookies.cartId) {
      const cartId = req.sessionID
      res.cookie('cartId', cartId, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 })
      req.cartId = cartId
    } else {
      req.cartId = req.cookies.cartId
    }
  }
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World! This is a Book Shop')
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
