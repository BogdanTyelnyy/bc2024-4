const { program } = require('commander');
const http = require('http');
const fs = require('node:fs');
const superagent = require('superagent');
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
    //console.log(req.method + " " + req.url);
    const pictureUrl = "https://http.cat" + req.url + ".jpg";
    const pictureFile = opts.cache + req.url + '.jpg';
    if (req.method === "GET") {
        fs.promises.readFile(pictureFile)
            .then(readPicture => {
                res.setHeader('Content-Type', 'image/jpeg');
                res.writeHead(200);
                res.end(readPicture);
            })
            .catch(error => {
                superagent
                    .put(`http://${opts.host}:${opts.port}${req.url}`)
                    .catch(error => {});
                res.writeHead(404);
                res.end('Picture has not found');
            });
    } else if (req.method === "PUT") {
        superagent.get(pictureUrl)
            .then(picture => {
                fs.promises.writeFile(pictureFile, picture.body);
                res.writeHead(201);
                res.end();
            })
            .catch(error => {
                res.writeHead(404);
                res.end();
            });
        return;
    } else if (req.method === "DELETE") {
        fs.promises.rm(pictureFile, {
            force : true
        });
        res.writeHead(200);
        res.end();
        return;
    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(opts.port, opts.host, () => {
    console.log(`Server is running on http://${opts.host}:${opts.port}`);
});