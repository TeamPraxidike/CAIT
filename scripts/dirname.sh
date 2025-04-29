#!/usr/bin/bash

sed -i '/await server.init/i \
globalThis.__filename = fileURLToPath(import.meta.url); \
globalThis.__dirname = path.dirname(__filename);' ./build/handler.js
