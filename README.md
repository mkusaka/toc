# toc

generate multiple markdwon document link cli.

# install

(cli is under development...)
```bash
yarn add @mkusaka/toc
```

# useage
cd /path/to/folder

install, and run

```bash
node node_modules/@mkusaka/toc/dist/index.js "glob pattern"
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
$ node node_modules/@mkusaka/toc/dist/index.js document/**/*.md
[document/nested/sample3](document/nested/sample3.md)
 - [some3](document/nested/sample3.md#some3)
 - [markdown3](document/nested/sample3.md#markdown3)
  - [like this3](document/nested/sample3.md#like%20this3)

[document/sample](document/sample.md)
 - [some](document/sample.md#some)
 - [markdown](document/sample.md#markdown)
  - [like this](document/sample.md#like%20this)

[document/sample2](document/sample2.md)
 - [some2](document/sample2.md#some2)
 - [markdown2](document/sample2.md#markdown2)
  - [like this2](document/sample2.md#like%20this2)
```

# TODO
- use [tj/commander.js: node.js command-line interfaces made easy](https://github.com/tj/commander.js/)
- validate globed file extension (may need `.md` only)
- add sort option
- export markdown generate function
