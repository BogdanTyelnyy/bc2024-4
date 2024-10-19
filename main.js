const { program } = require('commander');
const http = require('http');
const fs = require('node:fs');
program
    .option('-h, --host <address>', 'Server address')
    .option('-p, --port <number>', 'Server port')
    .option('-c, --cache <path>', 'Path to directory with cache files');

program.parse();

const opts = program.opts();
if (!opts.host) {
    console.error('Error: input host');
    return;
} else if (!opts.port) {
    console.error('Error: input port');
    return;
} else if (!opts.cache) {
    console.error('Error: input cache');
    return;
}

const server = http.createServer((req, res) => {
    //console.log(req.method + ' ' + req.url);
    if (req.method === "GET") {
        let picture = opts.cache + req.url + '.jpg';
        fs.promises.readFile(picture)
            .then(readPicture => {
                res.setHeader('Content-Type', 'image/jpeg');
                res.writeHead(200);
                res.end(readPicture);
            })
            .catch(error => {
                res.writeHead(404);
                res.end('Picture has not found');
            });
    } else if (req.method === "PUT") {

    } else if (req.method === "DELETE") {

    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(opts.port, opts.host, () => {
    console.log(`Server is running on http://${opts.host}:${opts.port}`);
});