const csvParser = require('csv-parser')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const Publisher = require('../models/publisher')
const Category = require('../models/category')

exports.uploadBooks = async (req, res) => {
  const filePath = req.file.path // Path to uploaded CSV file

  const books = [] // To store parsed books
  try {
    // Parse the CSV
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', row => books.push(row))
      .on('end', async () => {
        const createdBooks = []

        for (const book of books) {
          const {
            title,
            authorName,
            publisherName,
            categories, // e.g., "Category 1|Category 2"
            isbn,
            price,
            language,
            country,
            stock,
            description,
            pdf,
            coverImage
          } = book

          // Find or create author
          let author = await Author.findOne({ name: authorName })
          if (!author) {
            author = new Author({ name: authorName })
            await author.save()
          }

          // Find or create publisher
          let publisher = await Publisher.findOne({ name: publisherName })
          if (!publisher) {
            publisher = new Publisher({ name: publisherName })
            await publisher.save()
          }

          // Find or create categories
          const categoryIds = []
          const categoryNames = categories.split('|')
          for (const categoryName of categoryNames) {
            let category = await Category.findOne({ name: categoryName })
            if (!category) {
              category = new Category({ name: categoryName })
              await category.save()
            }
            categoryIds.push(category._id)
          }

          // Create the book with associated IDs
          const newBook = new Book({
            title,
            author: author._id,
            publisher: publisher._id,
            category: categoryIds,
            isbn,
            price: parseFloat(price),
            language: language || 'Bangla',
            country: country || 'Bangladesh',
            stock: parseInt(stock, 10),
            description,
            pdf,
            coverImage
          })

          await newBook.save()
          createdBooks.push(newBook)
        }

        res.status(201).json({
          message: 'Books uploaded successfully',
          data: createdBooks
        })
      })
  } catch (error) {
    console.error('Error uploading books:', error)
    res.status(500).json({ error: 'Error uploading books' })
  }
}
