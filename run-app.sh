#!/bin/bash
set -e

echo "Starting Backend..."
(
  cd backend || exit 1
  npm install
  node src/utils/seed.js
  npm run dev
) &

echo "Starting Frontend..."
(
  cd frontend || exit 1
  npm install
  npm run dev
) &

wait
