const express = require('express')
const router = express.Router()

router.post('/ssl-payment-success', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})
router.post('/ssl-payment-failure', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})
router.post('/ssl-payment-cancel', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})
router.post('/ssl-payment-ipn', async (req, res) => {
  return res.status(200).json({
    data: req.body
  })
})

module.exports = router
