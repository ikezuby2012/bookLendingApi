const fs = require("fs");
const crypto = require("crypto");
const validator = require("validator");
const routeHandler = {};

const book = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/../data/users.json`, "utf-8"));
const borrowedBooks = JSON.parse(fs.readFileSync(`${__dirname}/../data/borrowedBooks.json`, "utf-8"));


routeHandler.books = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._books[data.method](data, callback);
    } else {
        callback(405);
    }
}

routeHandler.user = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

routeHandler.lendBook = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._lendBook[data.method](data, callback);
    } else {
        callback(405);
    }
}

routeHandler.pawnBook = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._pawnBook[data.method](data, callback);
    } else {
        callback(405);
    }
}
//books method 
routeHandler._books = (data, callback) => {
    callback(200, { response: "server is live", data: book });
}

//create new book 
routeHandler._books.post = (data, callback) => {
    let id = (book[book.length - 1].id * 1) + 1;
    const newId = id.toString();
    // const newId = book[book.length - 1].id + 1;
    var name = typeof (data.payload.name) === "string" && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var price = typeof (data.payload.price) === 'string' && !isNaN(parseInt(data.payload.price)) ? data.payload.price : false;
    var author = typeof (data.payload.author) === 'string' && data.payload.author.trim().length > 0 ? data.payload.author : false;;
    var year_published = typeof (data.payload.year_published) === 'string' && !isNaN(parseInt(data.payload.year_published)) ? data.payload.year_published : false;
    var no_copies = typeof (data.payload.no_copies) === 'number' && !isNaN(parseInt(data.payload.no_copies)) ? data.payload.no_copies : false;
    if (name && price && author && year_published && no_copies) {
        const newObj = {
            id: newId,
            name,
            price,
            author,
            year_published,
            no_copies
        }
        book.push(newObj);
        fs.writeFile(`${__dirname}/../data/books.json`, JSON.stringify(book), (err) => {
            if (!err) {
                callback(201, { message: "book added successfully", data: book });
            } else {
                callback(400, { message: "could not add book" });
            }
        });

    }
}

//method to get book by id
//example localhost:5000/book?id=2
routeHandler._books.get = (data, callback) => {
    const { id } = data.query;
    console.log(id);
    var checkId;
    if (id) {
        checkId = id * 1;
    }

    checkId > book.length && !book ? callback(404, { message: "book not found or invalid id" }) : null;
    const checkBook = book.find(el => el.id === id);
    if (checkBook) {
        callback(200, {
            message: "book retrieved",
            data: checkBook
        });
    }

}

//method to update a book by id 
routeHandler._books.patch = (data, callback) => {
    const { id } = data.query;
    const { name, price, author, year_published, no_copies } = data.payload;
    id * 1 > book.length
        ? callback(400,
            {
                err: err,
                data: null,
                message: 'could not update book'
            })
        : null;
    const books = book.map(el => {
        if (el.id === id) {
            el.name = name;
            el.price = price;
            el.author = author;
            el.year_published = year_published;
            el.no_copies = no_copies;
        }
    })
    if (books) {
        fs.writeFile(`${__dirname}/../data/books.json`, JSON.stringify(books), (err) => {
            if (!err) {
                callback(200, { message: "book updated successfully", data: null });
            } else {
                callback(400, { message: "could not add book" });
            }
        });
    }
}

//
routeHandler._books.delete = (data, callback) => {
    const { id } = data.query;
    if (id) {
        book = book.filter(book => book.id !== id);
        fs.writeFile(`${__dirname}/../data/books.json`, JSON.stringify(book), (err) => {
            if (!err) {
                callback(201, { message: "book deleted successfully", data: null })
            } else {
                callback(400, { message: "operation failed!" });
            }
        })
    }
}

//user method
const userRoles = ["user", "admin"];
routeHandler._users = (data, callback) => {
    callback(200, { response: "server is live", data: book });
}

// this is a route for registering new user
// new user are assigned a token during registration
// this token allow user to borrow book
// this token just be send as an authorization header
routeHandler._users.post = (data, callback) => {
    let id = (users[users.length - 1].id * 1) + 1;
    const newId = id.toString();
    const token = crypto.randomBytes(8).toString("hex");

    var name = typeof (data.payload.name) === "string" && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var email = typeof (data.payload.email) === "string" && validator.isEmail(data.payload.email) ? data.payload.email : false;
    var password = typeof (data.payload.password) === "string" && data.payload.password.trim().length > 6 ? data.payload.password : false;
    var role = data.payload.role !== undefined && data.payload.role == "" ? data.payload.role : "user";
    const checkMail = users.find(el => el.email === data.payload.email);
    if (checkMail) {
        callback(400, { message: "user already exist!" });
    }
    if (name && email && password && role && checkMail == false) {
        const newObj = {
            id: newId,
            name,
            email,
            password,
            role,
            token
        }
        users.push(newObj);
        fs.writeFile(`${__dirname}/../data/users.json`, JSON.stringify(users), (err) => {
            if (!err) {
                callback(201, { message: "user registered successfully", data: null });
            } else {
                callback(400, { message: "could not register user" });
            }
        });
    }
}

//borrow book route
routeHandler._lendBook = (data, callback) => {
    callback(200, { response: "lendbook route is working" })
};

//this route is to lend a book
//only registered user can borrow book
//each request to borrow book must come with an authorization token as header 
//localhost:5000/lendBook?name=bleach
routeHandler._lendBook.get = (data, callback) => {
    let { token } = data.headers;
    const { name } = data.query;

    //if token is not a string convert to string
    token = typeof (token) == "string" ? token : token.toString();

    console.log(data.headers, token);
    console.log(name);
    //check if token and user exist
    if (token && (users.find(el => el.token == token))) {
        //check if book exist
        let checkBook = book.find(el => el.name == name);
        if (checkBook) {
            //check if books is available
            if (checkBook.no_copies > 0) {
                callback(200, {
                    response: `${checkBook.name} available for lent`,
                    data: checkBook
                });
                checkBook.no_copies -= 1;
                borrowedBooks.push(checkBook);
                fs.writeFile(`${__dirname}/../data/borrowedBooks.json`, JSON.stringify(borrowedBooks), (err) => {
                    if (!err) {
                        callback(201, { message: "operation  successful", data: null });
                    } else {
                        callback(400, { message: "operation failed!" });
                    }
                })
            } else {
                callback(400, { message: "could not borrow book" });
            }
        }
    }
}

//return borrowed book route
routeHandler._pawnBook = {};

//pawn book
//same process of lending book
//user must provide authorization token and name of book borrowed
routeHandler._pawnBook.get = (data, callback) => {
    let { token } = data.headers;
    const { name } = data.query;

    //if token is not a string convert to string
    token = typeof (token) == "string" ? token : token.toString();

    console.log(data.headers, token);
    console.log(name);
    //check if token and user exist
    if (token && (users.find(el => el.token == token))) {
        //check if book exist
        let checkBook = book.find(el => el.name == name);
        if (checkBook) {
            //check if books is available
            if (checkBook.no_copies > 0) {
                callback(200, {
                    response: `${checkBook.name} pawn successfully`,
                    data: checkBook
                });
                checkBook.no_copies += 1;
                borrowedBooks = borrowedBooks.filter(book => book.name !== name);
                fs.writeFile(`${__dirname}/../data/borrowedBooks.json`, JSON.stringify(borrowedBooks), (err) => {
                    if (!err) {
                        callback(201, { message: "operation  successful", data: borrowedBooks });
                    } else {
                        callback(400, { message: "operation failed!" });
                    }
                });
            } else {
                callback(400, { message: "could not pawn book" });
            }
        }
    }
}

routeHandler.borrowedBooks = (data, callback) => {
    callback(200, { response: "success", data: borrowedBooks });
}

routeHandler.ping = (data, callback) => {
    callback(200, { response: "server is live" });
}

routeHandler.notfound = (data, callback) => {
    callback(404, { response: 'not found' });
};
module.exports = routeHandler;