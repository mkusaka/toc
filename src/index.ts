import * as fg from "fast-glob";
import * as mdParser from "@textlint/markdown-to-ast";
import * as fs from "fs";
import * as path from "path";

export interface parsedAst {
  children: {
    type: string;
    children: {
      value: string;
    }[];
    depth: number;
  }[];
}

const patternString = process.argv[2];
const aggregateFilePath = process.argv[3];
const showDepth = parseInt(process.argv[4]);

export const globAsts = (
  pattern = patternString,
  aggregateFile: string = aggregateFilePath
) => {
  return fg(pattern)
    .then((paths) => {
      return {
        aggregateFile: aggregateFilePath,
        paths,
      };
    })
    .then(({ aggregateFile, paths }) => {
      return {
        aggregateFile,
        contents: paths.map((path) => {
          return {
            path: path as string,
            content: fs.readFileSync(path as string, { encoding: "utf-8" }),
          };
        }),
      };
    })
    .then(({ aggregateFile, contents }) => {
      return {
        aggregateFile,
        asts: contents.map(({ path, content }): {
          path: string;
          ast: parsedAst;
        } => {
          return {
            path: path,
            ast: mdParser.parse(content),
          };
        }),
      };
    });
};

export const globAstlike = (
  pattern = patternString,
  aggregateFile: string = aggregateFilePath
) => {
  return globAsts(pattern, aggregateFile).then(({ aggregateFile, asts }) => {
    return {
      aggregateFile,
      contentFiles: asts
        .map(({ path, ast }) => {
          return {
            filePath: path,
            headers: ast.children
              .filter((e) => e.type === mdParser.Syntax.Header)
              .map((e) => {
                return {
                  value: e.children[0].value,
                  depth: e.depth,
                };
              })
              .filter(({ depth }) => (showDepth ? depth <= showDepth : true)),
          };
        })
        .filter((e) => e.headers.length > 0),
    };
  });
};

const relativeStrings = [".", ".."];
const removeRelativePath = (pathArray: string[]) =>
  pathArray.filter((path) => !relativeStrings.includes(path));

export const md = (
  pattern = patternString,
  aggregateFile: string = aggregateFilePath
) => {
  return globAstlike(pattern, aggregateFile).then(
    ({ aggregateFile, contentFiles }) => {
      return contentFiles
        .map(({ filePath, headers }) => {
          let fixedFilePath = filePath;
          // TODO: isArrregateFile? like varable as `aggregateFile && aggregateFile.length > 0` to refactor some shared variable.
          const aggregate =
            aggregateFile && aggregateFile.length > 0
              ? aggregateFile.split("/")
              : [];
          const removeRelativeStringAggregate = removeRelativePath(aggregate);
          if (removeRelativeStringAggregate.length > 0) {
            const aggregated = filePath.split("/");
            const removeRelativeStringAggregated = removeRelativePath(
              aggregated
            );
            const min = Math.min(
              ...[
                removeRelativeStringAggregate,
                removeRelativeStringAggregated,
              ].map((e) => e.length)
            );
            for (let i = 0; i < min; i++) {
              if (
                removeRelativeStringAggregate[0] ===
                removeRelativeStringAggregate[0]
              ) {
                removeRelativeStringAggregated.shift();
                removeRelativeStringAggregate.shift();
              } else {
                break;
              }
            }
            fixedFilePath = removeRelativeStringAggregated.join("/");
          }
          const headersText = headers
            .map(({ value, depth }) => {
              const indent = "  ".repeat(depth - 1);
              return `${indent}- [${value}](${
                fixedFilePath && fixedFilePath.length > 0
                  ? `./${fixedFilePath}`
                  : ""
              }#${encodeURI(value.replace(/@|\//g, "").replace(/ /g, "-"))})`;
            })
            .join("\n");
          const fileMdPathText =
            fixedFilePath && fixedFilePath.length > 0
              ? `[${fixedFilePath.replace(
                  path.extname(fixedFilePath),
                  ""
                )}](./${fixedFilePath})`
              : "";
          return `${fileMdPathText}
${headersText}
`;
        })
        .join("\n");
    }
  );
};

export const standardStream = (
  pattern = patternString,
  aggregateFile: string = aggregateFilePath
) => {
  return md(pattern, aggregateFile).then((e) => console.log(e));
};
