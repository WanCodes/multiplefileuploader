const express = require('express');
const router = express.Router();
const multer = require('multer');
const pg = require('pg');

// Connection String with credentials
const connectionString = "postgres://postgres:@localhost/postgres";
const client = new pg.Client(connectionString);
client.connect();

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5 //accept file below 5mb
    }
});

/* GET home page. */
router.get('/', function(req, res) {
    const query = {
        name: 'all-files',
        text: 'SELECT * FROM files'
    }
    client.query(query)
    .then(result => {
        res.render('index', { files: result.rows });
    })
    .catch(e => {
        console.error(e.stack)
        res.status(500).json({
            error:e.stack
        });
    });
});

/* POST files */
router.post('/files', upload.array('file', 10), (req, res, next) => {
    const names = [];
    const buffers = [];
    req.files.forEach((file, index) => {
        names.push(file.originalname);
        buffers.push(file.buffer);
    });
    const query = {
        name: 'save-file',
        text: 'INSERT INTO files(name, file) SELECT * FROM UNNEST ($1::varchar[], $2::bytea[]) RETURNING *',
        values: [names, buffers]
    }
    client.query(query)
    .then(result => {
        res.status(200).json({
            files:result.rows
        });
    })
    .catch(e => {
        res.status(500).json({
            error:e.stack
        });
    });
});

/* GET file by id */
router.get('/files/:id', (req, res, next) =>{
    let _id = req.params.id;
    const query = {
        name: 'fetch-file',
        text: 'SELECT * FROM files WHERE id = $1',
        values: [_id]
    }
    client.query(query)
    .then(result => {
        let buffer = result.rows[0].file;
        res.setHeader('Content-Disposition', 'attachment; filename='+result.rows[0].name);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(new Buffer(buffer, 'binary'));
    })
    .catch(e => {
        res.status(404).json({
            error:e.stack
        });
    });
});

module.exports = router;