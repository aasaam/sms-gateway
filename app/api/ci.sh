#!/bin/bash

set -e

cd /app/api

# npm install

npm run lint

npm run test:cover

/app/api/test/totalCoverage.js
