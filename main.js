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
fs.mkdir(opts.cache, {
    recursive : true
}, err => {
    if (err) {
        console.log(err);
    }
});

const server = http.createServer((req, res) => {
    //console.log(req.method + " " + req.url);
    const pictureUrl = "https://http.cat" + req.url + ".jpg";
    const picturePath = opts.cache + req.url + '.jpg';
    if (req.method === "GET") {
        fs.promises.readFile(picturePath)
            .then(readPicture => {
                res.setHeader('Content-Type', 'image/jpeg');
                res.writeHead(200);
                res.end(readPicture);
            })
            .catch(error => {
                superagent.get(pictureUrl, (error, responce) => {
                    if(error) {
                        res.writeHead(404);
                        res.end('Eror 404\nPicture does not exist :`(');
                    } else {
                        fs.promises.writeFile(picturePath, responce.body);
                        res.setHeader('Content-Type', 'image/jpeg');
                        res.writeHead(200);
                        res.end(responce.body);
                    }
                });
            });
    } else if (req.method === "PUT") {
        let pictureFile = [];
        req.on('data', part => {
            pictureFile.push(part);
        });
        req.on('end', () => {
            const buffer = Buffer.concat(pictureFile);
            fs.promises.writeFile(picturePath, buffer)
                .then(() => {
                    res.writeHead(201);
                    res.end();
                })
                .catch(error => {
                    res.writeHead(404);
                    res.end();
                });
            });
    } else if (req.method === "DELETE") {
        fs.promises.rm(picturePath, {
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