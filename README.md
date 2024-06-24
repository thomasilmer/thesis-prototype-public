# GitHub Bot Insights

This repository was made for a bachelor thesis at Radboud University Nijmegen. The code is only published for research
transparency and is not meant to be used in production. Do not steal >:(

## Requirements

- Node.js v18
- npm v10

The project was developed using these versions. It will probably run on some older/newer versions, but I can
not give any guarantees.

## Setup

Installing Node packages: `npm ci`.

Transpiling the assets: `npm run prod`.

Setting up the database: `node deploy-database.js`.

Populating the database: `node populate-scenario-database.js && node populate-bot-database.js`.

## Running the webserver

You will need to create a `.env` file based on `.env.example` and set `GITHUB_ACCESS_TOKEN`. This token can be obtained from
your GitHub account.

Starting the webserver can be done with `node app.js`. The webserver runs at `localhost:3000` by default, but the
port can be changed in the `.env` file.
