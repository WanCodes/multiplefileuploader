# File Uploader

A Node.js web application for uploading multiple files and storing them in a PostgreSQL database. Users can select files from their device, upload them in one batch, and view or download any file previously stored in the database.

## Features

- **Multiple file upload** — Select and upload up to 10 files at once via a simple web interface
- **PostgreSQL storage** — Files are stored as binary data (BYTEA) in PostgreSQL
- **File listing** — Home page shows all files currently in the database
- **File download** — Click any listed file to download it by ID
- **Client-side validation** — Warnings for files over 5 MB and for more than 10 files; submit is disabled when limits are exceeded
- **Server-side limits** — Max 5 MB per file and 10 files per request enforced with Multer

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Templating:** Handlebars (express-handlebars)
- **File handling:** Multer (in-memory storage)
- **Database:** PostgreSQL (node-postgres / `pg`)
- **Frontend:** Bootstrap 4, jQuery
- **Dev:** Nodemon for auto-restart during development

## Project Structure

```
multiplefileuploader/
├── app.js              # Express app setup, middleware, view engine, routes
├── server.js           # Starts the HTTP server on port 8000
├── package.json
├── routes/
│   └── index.js        # Routes: GET /, POST /files, GET /files/:id
├── views/
│   └── index.hbs       # Main page: upload form + list of files in DB
├── public/
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       └── main.js     # File picker, validation, AJAX upload, UI updates
└── README.md
```

## Prerequisites

- **Node.js** (v8 or later recommended)
- **PostgreSQL** — installed and running, with a database and user for the app

## Installation

1. Clone or download the project and go to the project folder:
   ```bash
   cd multiplefileuploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `files` table in PostgreSQL (see [Database setup](#database-setup)).

4. (Optional) Adjust the database connection string in `routes/index.js` if your host, port, user, or database differ from the defaults.

5. Start the application:
   ```bash
   npm start
   ```
   Or run the server directly:
   ```bash
   node server.js
   ```

6. Open [http://localhost:8000/](http://localhost:8000/) in your browser.

## Database Setup

Default PostgreSQL settings used in the code:

| Setting  | Value     |
|----------|-----------|
| Host     | localhost |
| Port     | 5432      |
| User     | postgres  |
| Database | postgres  |

Create the table for storing files:

```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    file BYTEA
);
```

The connection string in `routes/index.js` is:

```js
const connectionString = "postgres://postgres:@localhost/postgres";
```

Update it if you use a different user, password, host, port, or database name.

## Usage

1. **Upload files:** Use “Choose one or more files” to select files (up to 10, each under 5 MB). The list and any size/count warnings appear below. Click “Submit” to upload.
2. **View stored files:** The “Files on the database” section lists all files (id and name) currently in the database.
3. **Download:** Click a file in the list to download it; the server serves it by ID from the `files` table.

## API Endpoints

| Method | Path        | Description |
|--------|-------------|-------------|
| GET    | `/`         | Renders the home page with all files from the database |
| POST   | `/files`    | Upload files (multipart, field name `file`, max 10 files, 5 MB each). Returns JSON with saved file rows. |
| GET    | `/files/:id`| Streams the file with the given `id` as an attachment (download). |

## Limits and Validation

- **Per file:** 5 MB max (enforced on server and warned on client).
- **Per request:** Up to 10 files (warned on client; server accepts up to 10 via `upload.array('file', 10)`).
- Submit button is disabled if any file is over 5 MB or if more than 10 files are selected.

## Scripts

- `npm start` — Runs the app with **nodemon** (restarts on file changes).
- `npm test` — Placeholder; no tests configured yet.

## License

ISC · Author: wanyau
