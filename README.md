# @mkusaka/toc
## table of contents
- [@mkusaka/toc](#mkusakatoc)
  - [table of contents](#table-of-contents)
- [install](#install)
- [usage](#usage)
- [example](#example)
- [TODO](#TODO)

generate multiple markdwon document link cli.

# install

```bash
yarn global add @mkusaka/toc
# or
npm install -g @mkusaka/toc
```

# usage
cd /path/to/folder

install, and run

```bash
mdoctoc "glob pattern"
```
or

```bash
npx @mkusaka/toc "path to folder"
```

then markdown link comes to standard streams.

# example
document/sample.md

```md
# some
# markdown
## like this
```

document/sample2.md

```md
# some2
# markdown2
## like this2
```

document/nested/sample3.md

```md
# some3
# markdown3
## like this3
```

then output like follow.
```bash
$ mdoctoc "document/**/*.md"
[document/nested/sample3](./document/nested/sample3.md)
- [some3](./document/nested/sample3.md#some3)
- [markdown3](./document/nested/sample3.md#markdown3)
  - [like this3](./document/nested/sample3.md#like%20this3)

[document/sample](./document/sample.md)
- [some](./document/sample.md#some)
- [markdown](./document/sample.md#markdown)
  - [like this](./document/sample.md#like%20this)

[document/sample2](./document/sample2.md)
- [some2](./document/sample2.md#some2)
- [markdown2](./document/sample2.md#markdown2)
  - [like this2](./document/sample2.md#like%20this2)
```

if above toc shown at document/readme.md, we can specify it and script returns better toc path.

```bash
$ mdoctoc "document/**/*.md" "document/README.md"
[nested/sample3](./nested/sample3.md)
- [some3](./nested/sample3.md#some3)
- [markdown3](./nested/sample3.md#markdown3)
  - [like this3](./nested/sample3.md#like%20this3)

[sample](./sample.md)
- [some](./sample.md#some)
- [markdown](./sample.md#markdown)
  - [like this](./sample.md#like%20this)

[sample2](./sample2.md)
- [some2](./sample2.md#some2)
- [markdown2](./sample2.md#markdown2)
  - [like this2](./sample2.md#like%20this2)
```

if you want filter depth(# → depth 1, ## → depth 2). run like follow

```bash
# (sorry, second "./" argument required if use depth option right now... it will be option using commander.js)
$ mdoctoc "document/**/*.md" "./" 1
[document/nested/sample3](./document/nested/sample3.md)
- [some3](./document/nested/sample3.md#some3)
- [markdown3](./document/nested/sample3.md#markdown3)

[document/sample](./document/sample.md)
- [some](./document/sample.md#some)
- [markdown](./document/sample.md#markdown)

[document/sample2](./document/sample2.md)
- [some2](./document/sample2.md#some2)
- [markdown2](./document/sample2.md#markdown2)
```

# TODO
- use [tj/commander.js: node.js command-line interfaces made easy](https://github.com/tj/commander.js/)
- validate globed file extension (may need `.md` only)
- add sort option
- add show depth option
- deal with relative file
  - ex: `document/first/sample.md` (with content only `# foo`), `document/second/README.md`. `node script.js "document/**/*.md" "document/second/README.md"` then expected output path for `sample.md` is `[foo](../first/sample.md#foo)`.
- add tests
