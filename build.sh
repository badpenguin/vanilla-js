#!/usr/bin/env bash

# Poor Man Builder
#cat src/core.js src/lightbox.js > docs/vanilla-js.min.js

closure-compiler \
    --js src/polyfill.js \
    --js src/core.js \
    --js src/lightbox.js  --js src/lazyload.js   --js src/copyright.js \
    --js src/visibility.js src/scroll-direction.js \
    --js_output_file docs/vanilla-js.min.js --create_source_map docs/vanilla-js.min.js.map

cp docs/vanilla-js.min.js* dist/

#--language_in ECMASCRIPT5 \ --compilation_level SIMPLE_OPTIMIZATIONS \
# [WHITESPACE_ONLY   : Specifies the compilation level to
# | SIMPLE_OPTIMIZATIONS |                 use. Options: WHITESPACE_ONLY,
# ADVANCED_OPTIMIZATIONS]                  SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZ
#                                          ATIONS (default: SIMPLE_OPTIMIZATIONS)
