const express = require('express')
const addressController = require('../controllers/address')
const optionalProtect = require('../middleware/cartProtect')

const router = express.Router()

router.post('/', optionalProtect, addressController.createAddress)
router.get('/', optionalProtect, addressController.getAllAddresses)
router.get('/:id', addressController.getUserAddresses)
router.put('/:id', addressController.updateAddress)
router.delete('/:id', addressController.deleteAddress)

module.exports = router
