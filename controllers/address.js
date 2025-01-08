const Address = require('../models/address')

exports.createAddress = async (req, res) => {
  const userId = req.user._id

  try {
    const {
      name,
      phone,
      alternativeNumber,
      country = 'Bangladesh',
      region = 'Dhaka',
      city,
      area,
      zone,
      addressDetails,
      type
    } = req.body

    // Validate input (can be enhanced with a validation library)
    if (!name || !phone || !city || !type) {
      return res
        .status(400)
        .json({ error: 'Name, phone, city, and type are required fields' })
    }

    const newAddress = new Address({
      userId,
      name,
      phone,
      alternativeNumber,
      country,
      region,
      city,
      area,
      zone,
      addressDetails,
      type
    })

    await newAddress.save()
    res.status(201).json(newAddress)
  } catch (error) {
    console.error('Error creating address:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getAllAddresses = async (req, res) => {
  const userId = req?.user?._id
  try {
    const addresses = await Address.find({ userId })
    res.status(200).json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id // Assuming `req.user` contains the user's ID

    const addresses = await Address.find({ userId })
    res.status(200).json(addresses)
  } catch (error) {
    console.error('Error fetching user addresses:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { id } = req.params
    const updatedData = req.body

    const updatedAddress = await Address.findByIdAndUpdate(
      { _id: id, userId },
      updatedData,
      {
        new: true, // Returns the updated document
        runValidators: true // Ensures validation is applied during update
      }
    )

    if (!updatedAddress) {
      return res.status(404).json({ error: 'Address not found' })
    }

    res.status(200).json(updatedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id
    const { id } = req.params
    const deletedAddress = await Address.findByIdAndDelete({ _id: id, userId })

    if (!deletedAddress) {
      return res.status(404).json({ error: 'Address not found' })
    }

    res.status(200).json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
