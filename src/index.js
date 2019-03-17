import * as glob from "glob";
const patternString = process.argv[2];

async function find(globPattern) {
  return await glob(globPattern, function (err, files) {
    if (err) {
      console.log(err);
    }
    return files;
  });
}

debugger

find(patternString)
  .then(e => console.log(e));

