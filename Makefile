ALL: docs/vanilla.min.css docs/vanilla.min.css.map docs/vanilla-js.min.js docs/vanilla-js.min.js.map

docs/vanilla.min.css docs/vanilla.min.css.map:../vanilla-css-v2/docs/vanilla.min.css ../vanilla-css-v2/docs/vanilla.min.css.map
	cp -vu ../vanilla-css-v2/docs/vanilla.min.css* docs/

SOURCES=$(wildcard src/*.js)

docs/vanilla-js.min.js docs/vanilla-js.min.js.map : $(SOURCES) Makefile build.sh
	./build.sh

clean:
	rm -vf docs/vanilla.min.css* docs/vanilla-js.min*

