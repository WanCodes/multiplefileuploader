# File Uploader

Simple node js application for uploading multiple files to a postgres database.

## Getting Started

Run "npm install" to download all the packages then run "npm start" or "node server" then open http://localhost:8000/

## Postgres Database settings

Postgress database settings:
Host: localhost
Port: 5432
User: postgres
Database: postgres

Create a table called files with id, name and file using the following sql query:

CREATE TABLE files (
	id SERIAL PRIMARY KEY,
	name VARCHAR (255),
    file BYTEA
)