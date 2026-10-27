const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found" });
});
  
public_users.get('/author/:author', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].author === req.params.author)
    .map(key => ({ isbn: key, ...books[key] }));
  return res.status(200).json({ booksbyauthor: result });
});

public_users.get('/title/:title', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].title === req.params.title)
    .map(key => ({ isbn: key, ...books[key] }));
  return res.status(200).json({ booksbytitle: result });
});

public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

const BASE = "http://localhost:5000";

// Get all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book by ISBN using promise callbacks with Axios
public_users.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`${BASE}/isbn/${req.params.isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(error => res.status(500).json({ message: error.message }));
});

// Get books by author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get books by title using async/await with Axios
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.general = public_users;
