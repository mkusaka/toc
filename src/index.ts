import * as glob from "glob";
import * as mdParser from "@textlint/markdown-to-ast";
import * as fs from "fs";
import * as path from "path";

export interface parsedAst {
  children: {
    type: string,
    children: {
      value: string,
    }[],
    depth: number
  }[],
}

const patternString = process.argv[2];

export function asyncGlob(globPattern: string = patternString): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!globPattern || globPattern.length == 0) {
      console.log("glob pattern string to argument required.");
      return reject();
    }

    return glob(globPattern, function(err, files) {
      if (err) {
        return reject(err);
      }
      return resolve(files);
    });
  })
}

export const globAsts = (pattern = patternString) => {
  return asyncGlob(pattern)
    .then((paths: string[]) => {
      return paths.map(path => {
        return {
          path: path,
          content: fs.readFileSync(path, { encoding: "UTF-8" })
        };
      });
    })
    .then((contents: { path: string; content: string }[]) => {
      return contents.map(
        ({ path, content }): { path: string; ast: parsedAst } => {
          return {
            path: path,
            ast: mdParser.parse(content)
          };
        }
      );
    });
}

export const globAstlike = (pattern = patternString) => {
  return globAsts(pattern).then(asts => {
    return asts
      .map(({ path, ast }) => {
        return {
          filePath: path,
          headers: ast.children
            .filter(e => e.type === mdParser.Syntax.Header)
            .map(e => {
              return {
                value: e.children[0].value,
                depth: e.depth
              };
            })
        };
      })
      .filter(e => e.headers.length > 0);
  });
}

export const md = (pattern = patternString) => {
  return globAstlike(pattern).then(contentFiles => {
    return contentFiles.map(({ filePath, headers }) => {
      const headersText = headers.map(({ value, depth }) => {
        const indent = ' '.repeat(depth);
        return `${indent}- [${value}](${filePath}#${encodeURI(value)})`
      }).join("\n")
      return `[${filePath.replace(path.extname(filePath), "")}](${filePath})
${headersText}
`
    }).join("\n")
  });
}

export const standardStream = (pattern = patternString) => {
  return md(pattern).then(e => console.log(e))
}
