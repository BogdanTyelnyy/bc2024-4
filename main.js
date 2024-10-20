const { program } = require('commander');
const http = require('http');
const fs = require('node:fs');
const agent = require('superagent');
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
    if (req.method === "GET") {
        const picture = opts.cache + req.url + '.jpg';
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
        const picture = opts.cache + req.url + '.jpg';
        fs.promises.rm(picture, {
            force : true
        });
        res.writeHead(200);
        res.end();
    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(opts.port, opts.host, () => {
    console.log(`Server is running on http://${opts.host}:${opts.port}`);
});