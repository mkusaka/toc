const glob = require('glob');
const mdParser = require('@textlint/markdown-to-ast');
const fs = require('fs');
const path = require('path');

const patternString = process.argv[2];

function asyncGlob(globPattern) {
  return new Promise((resolve, reject) => {
    return glob(globPattern, function (err, files) {
      if (err) {
        return reject(err)
      }
      return resolve(files);
    });
  })
}

asyncGlob(patternString)
  .then(paths => {
    return paths.map(path => {
      return {
        path: path,
        content: fs.readFileSync(path, { encoding: 'UTF-8' })
      };
    })
  })
  .then(contents => {
    return contents.map(({ path, content }) => {
      return {
        path: path,
        ast: mdParser.parse(content)
      };
    })
  })
  .then(asts => {
    return asts.map(({ path, ast }) => {
      return {
        filePath: path,
        headers: ast.children.filter(e => e.type === mdParser.Syntax.Header).map(e => {
          return {
            value: e.children[0].value,
            depth: e.depth
          }
        })
      }
    }).filter(e => e.headers.length > 0);
  })
  .then(contentFiles => {
    return contentFiles.map(({ filePath, headers }) => {
      const headersText = headers.map(({ value, depth }) => {
        const indent = ' '.repeat(depth);
        return `${indent}- [${value}](${filePath}#${encodeURI(value)})`
      }).join("\n")
      return `[${filePath.replace(path.extname(filePath), "")}](${filePath})
${headersText}
`
    }).join("\n")
  })
  .then(e => console.log(e));
