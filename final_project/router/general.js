const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json(
            { message: "Nombre de usuario y contraseña son requeridos" });
    }
    if (!isValid(username)) {
        return res.status(409).json(
            { message: "El nombre de usuario ya existe" });
    }
    users.push({ username, password });
    return res.status(201).json(
        { message: "Usuario registrado exitosamente" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const filteredBooks = Object.values(books).filter(book =>
        book.author.toLowerCase() === author
    );

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json(
            { message: "No se encontraron libros con ese autor" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book =>
        book.title.toLowerCase() === title
    );

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json(
            { message: "No se encontraron libros con ese título" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

function getBooksAsync() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

public_users.get("/async/books", async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: "Error al obtener los libros" });
    }
});

function getBookByISBNAsync(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject("Libro no encontrado");
    });
}


public_users.get("/async/isbn/:isbn", async (req, res) => {
    try {
        const book = await getBookByISBNAsync(req.params.isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

function getBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book =>
            book.title.toLowerCase() === title.toLowerCase()
        );
        if (filteredBooks.length > 0) resolve(filteredBooks);
        else reject("No se encontraron libros con ese título");
    });
}

public_users.get("/async/title/:title", async (req, res) => {
    try {
        const booksByTitle = await getBooksByTitleAsync(req.params.title);
        return res.status(200).json(booksByTitle);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


module.exports.general = public_users;