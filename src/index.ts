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
const aggregateFilePath = process.argv[3] || "./"; // if not setted aggregateFilePath, glob response unexpected file array.

export function asyncGlob(globPattern: string = patternString, aggregateFile: string = aggregateFilePath): Promise<{ aggregateFile: string, paths: string[] }> {
  return new Promise((resolve, reject) => {
    if (!globPattern || globPattern.length == 0) {
      console.log("glob pattern string to argument required.");
      return reject();
    }
    return glob(globPattern, function(err, paths) {
      if (err) {
        return reject(err);
      }
      return resolve({
        aggregateFile,
        paths: paths
      });
    });
  })
}

export const globAsts = (pattern = patternString) => {
  return asyncGlob(pattern)
    .then(({ aggregateFile, paths }) => {
      return {
        aggregateFile,
        contents: paths.map(path => {
          return {
            path: path,
            content: fs.readFileSync(path, { encoding: 'UTF-8' })
          };
        })
      };
    })
    .then(({ aggregateFile, contents }) => {
      return {
        aggregateFile,
        asts: contents.map(
          ({ path, content }): { path: string; ast: parsedAst } => {
            return {
              path: path,
              ast: mdParser.parse(content)
            };
          }
        )
      };
    });
}

export const globAstlike = (pattern = patternString) => {
  return globAsts(pattern).then(({ aggregateFile, asts }) => {
    return {
      aggregateFile,
      contentFiles: asts
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
        .filter(e => e.headers.length > 0)
    };
  });
}

export const md = (pattern = patternString) => {
  return globAstlike(pattern).then(({ aggregateFile, contentFiles }) => {
    return contentFiles.map(({ filePath, headers }) => {
      let fixedFilePath = filePath;
      const aggregate = aggregateFile && aggregateFile.length > 0 ? aggregateFile.split('/') : [];
      if (aggregate.length > 0) {
        // TODO: deal with one path './some/folder' and the other path 'some/folder' pattern.
        const aggregated = filePath.split('/');
        const min = Math.min(...[aggregate, aggregated].map(e => e.length));
        for (let i = 0; i < min; i++) {
          if (aggregate[0] === aggregated[0]) {
            aggregated.shift();
            aggregate.shift();
          } else {
            ;
          }
        }
        fixedFilePath = aggregated.join('/');
      }
      const headersText = headers.map(({ value, depth }) => {
        const indent = " ".repeat(depth);
        return `${indent}- [${value}](${fixedFilePath && fixedFilePath.length > 0 ? `./${fixedFilePath}` : "" }#${encodeURI(value)})`;
      }).join("\n")
      const fileMdPathText = fixedFilePath && fixedFilePath.length > 0 ? `[${fixedFilePath.replace(path.extname(fixedFilePath), "")}](./${fixedFilePath})` : "";
      return `${fileMdPathText}
${headersText}
`
    }).join("\n")
  });
}

export const standardStream = (pattern = patternString) => {
  return md(pattern).then(e => console.log(e))
}
