#!/usr/bin/env bash
set -e

# Poor Man Builder
#cat src/core.js src/lightbox.js > docs/vanilla-js.min.js

closure-compiler \
    --js src/polyfill.js \
    --js src/core.js \
    --js src/ajax.js \
    --js src/cookie.js \
    --js src/copyright.js \
    --js src/lazyload.js \
    --js src/lightbox.js \
    --js src/scroll-detector.js \
    --js src/visibility.js \
    --js src/form-utils.js --js src/form.js \
    --js src/dialog.js \
    --js src/sha256.js \
    --language_in ECMASCRIPT5 \
    --js_output_file docs/vanilla-js.min.js --create_source_map docs/vanilla-js.min.js.map

cp -v docs/vanilla-js.min.js* dist/
