const http = require("http");
const url = require("url");
const { StringDecoder } = require('string_decoder');

const routeHandler = require("./utils/routeHandler");

const server = http.createServer((req, res) => {
    let parsedURL = url.parse(req.url, true);
    let path = parsedURL.pathname;

    path = path.replace(/^\/+|\/+$/g, "");
    console.log(path);
    let qs = parsedURL.query;
    let headers = req.headers;
    let method = req.method.toLowerCase();

    const decoder = new StringDecoder('utf-8');
    var buffer = "";
    var payload;

    req.on('data', (data) => {
        buffer += decoder.write(data);
        // buffer += data;
    });

    req.on("end", () => {
        buffer += decoder.end();

        if (req.method === "POST") {
            payload = JSON.parse(buffer);
        }

        const data = {
            path,
            method,
            query: qs,
            headers,
            payload
        };

        var chosenHandler = typeof router[path] !== "undefined" ? router[path] : router["notFound"];
        chosenHandler(data, (statusCode, result) => {
            statusCode = typeof (statusCode) === "number" ? statusCode : 200;
            result = typeof (res) === "object" ? result : {};
            const responseObj = JSON.stringify(result);
            res.setHeader('Content-type', "application/json");
            res.writeHead(statusCode);

            res.write(responseObj);
            res.end();
            console.log(`the url visited was, ${path} and the method is ${method} and query is ${JSON.stringify(qs)}`);
        });
    })
});

const PORT = process.env.port || 5000;

server.listen(PORT, () => {
    console.log(`now listening to port ${PORT}`);
});

const router = {
    ping: routeHandler.ping,
    book: routeHandler.books,
    registerUser: routeHandler.user,
    lendBook: routeHandler.lendBook,
    pawnBook: routeHandler.pawnBook,
    borrowedBooks: routeHandler.borrowedBooks,
    notFound: routeHandler.notfound
}
