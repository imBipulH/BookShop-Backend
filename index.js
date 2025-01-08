require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo')
const cors = require('cors')
const session = require('express-session')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const { protect } = require('./middleware/auth')
const app = express()

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.SSL_STORE_ID
const store_passwd = process.env.SSL_STORE_PASSWORD
const is_live = false

const PORT = process.env.PORT
connectDB()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}
app.use(cors(corsOptions))

app.set('trust proxy', 1) // Trust first proxy

// Serve static files from the 'uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: { maxAge: 14 * 24 * 60 * 60, httpOnly: false, secure: false }
  })
)
// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGO_URI,
//       collectionName: 'sessions',
//       ttl: 14 * 24 * 60 * 60
//     }),
//     cookie: {
//       maxAge: 14 * 24 * 60 * 60 * 1000,
//       secure: false,
//       httpOnly: true,
//       sameSite: 'none' // Set to `true` if using HTTPS
//     }
//   })
// )

// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     // rolling: true, // Automatically renew the session cookie
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGO_URI,
//       collectionName: 'sessions',
//       ttl: 14 * 24 * 60 * 60
//     }),
//     cookie: {
//       maxAge: 14 * 24 * 60 * 60 * 1000,
//       secure: false,
//       httpOnly: true,
//       sameSite: 'lax'
//     } // Set to `true` if using HTTPS
//   })
// )
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
// for debugging purposes only
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})
app.use((req, res, next) => {
  console.log('Cookies:', req.cookies)
  console.log('Session ID:', req.sessionID)
  next()
})

const uploadRoutes = require('./routes/uploadRoutes')
const optionalProtect = require('./middleware/cartProtect')
// Routes
app.use('/', require('./routes/authRoutes'))
// app.use('/', require('./routes/sslRoutes'))
app.use('/categories', require('./routes/categoryRoutes'))
app.use('/books', require('./routes/bookRoutes'))
app.use('/author', require('./routes/authorRoutes'))
app.use('/publisher', require('./routes/publisherRoutes'))
app.use('/cart', require('./routes/cartRoutes'))
app.use('/order', require('./routes/orderRoutes'))
app.use('/reviews', require('./routes/reviewRoutes'))
app.use('/wishlist', optionalProtect, require('./routes/wishlistRoutes'))
app.use('/address', protect, require('./routes/addressRoutes'))
app.use('/uploads', uploadRoutes)

app.use(errorHandler)
// app.use((req, res, next) => {
//   console.log(req.cookies)
//   if (req.user) {
//     // assuming req.user is set after login
//     req.cartId = req.user.id
//   } else {
//     if (!req.cookies) {
//       const cartId = req.sessionID
//       res.cookie('cartId', cartId, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 })
//       req.cartId = cartId
//     } else {
//       req.cartId = req.cookies.cartId
//     }
//   }
//   next()
// })

app.get('/', (req, res) => {
  console.log(req.session)

  res.cookie('testCookie', 'testValue', {
    httpOnly: true,
    // signed: true,
    maxAge: 60000
  })
  res.send('Hello World! This is a Book Shop')
})

// SSL Init

app.get('/ssl-request', (req, res) => {
  const data = {
    total_amount: 100,
    currency: 'BDT',
    tran_id: 'REF123', // use unique tran_id for each api call
    success_url: 'http://localhost:8000/ssl-payment-success',
    fail_url: 'http://localhost:8000/ssl-payment-failure',
    cancel_url: 'http://localhost:8000/ssl-payment-cancel',
    ipn_url: 'http://localhost:8000/ssl-payment-ipn',
    shipping_method: 'Courier',
    product_name: 'Computer.',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh'
  }
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
  sslcz.init(data).then(apiResponse => {
    // Redirect the user to payment gateway

    console.log(data)
    console.log(apiResponse)

    let GatewayPageURL = apiResponse.GatewayPageURL
    res.redirect(GatewayPageURL)
    console.log('Redirecting to: ', GatewayPageURL)
  })
})

app.post('/ssl-payment-success', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})
app.post('/ssl-payment-failure', async (req, res) => {
  return res.status(400).json({
    data: req.body
  })
})
app.post('/ssl-payment-cancel', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})
app.post('/ssl-payment-ipn', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})

// SSL End

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
