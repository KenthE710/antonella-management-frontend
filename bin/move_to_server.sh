#!/bin/sh

bun run build --prod

rm -r ../antonella-management-server/static/frontend/*
cp -r dist/antonella-management/browser/* ../antonella-management-server/static/frontend/
