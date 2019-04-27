import * as glob from "glob";
import * as mdParser from "@textlint/markdown-to-ast";
import * as fs from 'fs';
import * as path from 'path';

interface parsedAst {
  children: {
    type: string,
    children: {
      value: string,
    }[],
    depth: number
  }[],
}

const patternString = process.argv[2];

function asyncGlob(globPattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    return glob(globPattern, function(err, files) {
      if (err) {
        return reject(err);
      }
      return resolve(files);
    });
  })
}

asyncGlob(patternString)
  .then((paths: string[]) => {
    return paths.map(path => {
      return {
        path: path,
        content: fs.readFileSync(path, { encoding: 'UTF-8' })
      };
    })
  })
  .then((contents: {
    path: string,
    content: string
  }[]) => {
    return contents.map(
      ({ path, content }): { path: string; ast: parsedAst } => {
        return {
          path: path,
          ast: mdParser.parse(content)
        };
      }
    );
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
