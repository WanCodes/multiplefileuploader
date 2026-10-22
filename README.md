# Multiple File Uploader

Node.js server that accepts a batch of files and stores each one in PostgreSQL. One page lists what is already saved and downloads a file by id.

**Wan Yau** · [WanCodes](https://github.com/WanCodes)

A small full-stack sample: multipart upload, a parameterized batch insert, and a `BYTEA` round-trip. Built as a local demo.

## What it does

- Choose up to 10 files in the browser and submit them in one request.
- Store each file in the `files` table as `name` (the original filename) and `file` (`BYTEA`).
- List saved rows on the home page as `id - name`.
- Download a row with `GET /files/:id`. The response is an attachment (`application/octet-stream`).
- Warn in the browser, and disable submit, when a file is over 5 MB or when more than 10 files are selected. Multer enforces the same 5 MB per-file cap and a maximum of 10 files.

## Stack

| Piece | Role |
| --- | --- |
| Node.js | CommonJS app. `package.json` does not set `engines`. |
| Express `^4.16.4` | HTTP server and router |
| express-handlebars `^3.0.0` | Renders `views/index.hbs` |
| Multer `^1.4.1` | Multipart parsing with `memoryStorage()` |
| pg `^6.1.0` | node-postgres client |
| body-parser `^1.18.3` | JSON and urlencoded parsers. The upload route is parsed by Multer. |
| Bootstrap 4.1.3, jQuery 3.3.1, Popper 1.14.3 | Page UI, loaded from CDNs in `views/index.hbs` |
| Nodemon `^1.18.6` | Dev dependency. `npm start` runs `nodemon server.js`. |

The npm package is `fileuploader` at version `1.0.0`, license ISC. The `author` field is `wanyau`.

## Layout

```
multiplefileuploader/
├── app.js                 # Express, Handlebars, static files, route mount
├── server.js              # Listens on port 8000
├── package.json
├── routes/index.js        # GET /, POST /files, GET /files/:id, database client
├── views/index.hbs        # Upload form and saved-file list
└── public/
    ├── css/style.css
    └── js/main.js         # File list, client checks, AJAX upload
```

`app.js` registers Handlebars with extension `hbs`, `defaultLayout` set to `index`, and `layoutsDir` pointed at `views/`. `views/index.hbs` is the only template.

## Configuration

This repo has no environment variables. The code does not read `process.env`, and there is no `.env` file.

| Name in code | File | Committed value |
| --- | --- | --- |
| `port` | `server.js` | `8000` |
| `connectionString` | `routes/index.js` | `postgres://postgres:@localhost/postgres` |
| upload URL | `public/js/main.js` | `http://localhost:8000/files` |

That Postgres URL is role `postgres`, an empty password, host `localhost`, and database `postgres`. The port is omitted, so `pg` uses `5432`.

Edit `connectionString` when the role, password, host, or database name differ. Leave real passwords out of git.

The page always posts to `http://localhost:8000/files`, so the upload button expects the server on that host and port.

## Prerequisites

- Node.js and npm
- PostgreSQL running and reachable with the connection string above
- Network access to the Bootstrap and jQuery CDNs when you open the page (the upload script depends on jQuery)

## Database

The server does not create tables. Run this once in the target database before the first request:

```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    file BYTEA
);
```

## Run

Start PostgreSQL first. `routes/index.js` calls `client.connect()` when the module loads.

```bash
npm install
npm start
```

`npm start` is `nodemon server.js`, so the process restarts when files change. Nodemon is a dev dependency. After an install that omits dev dependencies, start the server with:

```bash
node server.js
```

Open [http://localhost:8000/](http://localhost:8000/).

`npm test` prints `Error: no test specified` and exits 1. There is no test suite.

## Using the page

1. Choose one or more files. Names appear under the picker. A file over 5 MB is marked in red, and more than 10 files shows a warning. Submit stays disabled in both cases. It stays hidden until at least one file is selected.
2. Submit. `public/js/main.js` posts `multipart/form-data` and, on success, appends each new `id - name` link.
3. Click a saved file to download it.

## HTTP

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/` | `SELECT * FROM files`, then render `index` with `files` set to `result.rows`. A query error responds `500` with JSON `{ "error": ... }`. |
| `POST` | `/files` | `upload.array('file', 10)`. Inserts every part and returns `200` with JSON `{ "files": [rows] }`. A query error responds `500` with JSON `{ "error": ... }`. |
| `GET` | `/files/:id` | `SELECT * FROM files WHERE id = $1`. Sends the `BYTEA` as an attachment, using the stored `name`. A failure responds `404` with JSON `{ "error": ... }`. |

Static assets are served from `public/`.

The insert is one parameterized statement:

```sql
INSERT INTO files(name, file)
SELECT * FROM UNNEST ($1::varchar[], $2::bytea[])
RETURNING *
```

`$1` is the original filenames and `$2` is the in-memory buffers. Multer’s field name is `file`. The browser also sends a `name` part; the route stores Multer’s `originalname`.

## Limits

| Check | Where | Rule |
| --- | --- | --- |
| File size | Multer `limits.fileSize` | `1024 * 1024 * 5` (5 MB) per file |
| File count | `upload.array('file', 10)` | 10 files per request |
| File size | `public/js/main.js` | Warning, and submit disabled, above `5242880` bytes |
| File count | `public/js/main.js` | Warning, and submit disabled, above 10 files |

A Multer rejection, such as a file over 5 MB posted outside this page, is left to Express’s default error handler. The route has no Multer error middleware.

## How a file is stored

Uploads stay in memory. Multer’s `memoryStorage()` holds each buffer, and PostgreSQL stores those bytes in `files.file`. One `pg.Client` is created when `routes/index.js` loads and is reused for every query.

`GET /` and the insert’s `RETURNING *` both load the `BYTEA` column into Node. The template prints `id` and `name` only. The download route is what sends the bytes to the browser.

## Scope

Local demo of the upload path: open routes, any file type, and the client-supplied filename stored and later written into `Content-Disposition`. Use a local database role.

## License

ISC · Wan Yau ([WanCodes](https://github.com/WanCodes))
