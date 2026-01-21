const { stdout, stdin, exit } = process;
var colors = require("colors");
const path = require("path");
let fs = require("fs");
const fs_promise = fs.promises;

const folder = __dirname.replace(/\\server_folder/, "");

console.log("folder".bgCyan, folder);

const outputDir = ["css", "images"];
const { compose, replaceReservedSymbol, replaceRushienLetter } = require("./correct_path.js");
console.clear();

(function () {
  Promise.race(outputDir.map((e) => start(path.join(folder, e), path.join(folder, "dist", e))));
  //outputDir.forEach(e => start(path.join(folder, e), path.join(folder, "dist", e)))
})();

async function start(direct, directOutput) {
  try {
    console.log("direct источник".bgCyan, direct);
    console.log("direct приемник".bgCyan, directOutput);
    await fs.exists(directOutput, async (exit) => {
      if (!exit) {
        fs.mkdir(directOutput, { recursive: true }, async (err) => {
          if (err) throw err;
          console.log("-------create directory---------".bgCyan, directOutput);
          await readFileInDir(direct, directOutput);
        });
      }
      /*else {
        console.log(`удаляю каталог: ${directOutput}`.underline.bgYellow);
        let dirDeleted = await reamovecatalog(directOutput);
        console.log(`удалил каталог: ${dirDeleted}`.underline.bgGreen);
        await start(direct, dirDeleted);
        console.log("должен создать каталог:", dirDeleted);
      }
        */
    });
  } catch (e) {
    console.log(e);
  }
}

async function reamovecatalog(dir) {
  try {
    let files = await fs.promises.readdir(dir, { encoding: "utf-8", withFileTypes: true });
    for await (let file of files) {
      let newdir = path.join(dir, file.name);
      if (file.isFile()) {
        console.log(`deleted file `, newdir);
        fs.promises.unlink(newdir);
      } else await reamovecatalog(newdir);
    }
    console.log(`delted каталог `.rainbow, dir.rainbow);
    await fs.promises.rmdir(dir);
    return dir;
  } catch (error) {
    console.log(error);
  }
}

async function readFileInDir(directSource, directOutput) {
  try {
    const files = await fs_promise.readdir(directSource);
    for await (const file of files) {
      const pathToFile = path.join(directSource, file);
      const itemStats = await fs_promise.stat(pathToFile);
      if (itemStats.isFile()) {
        let output = fs.createReadStream(path.join(directSource, file));
        let input = fs.createWriteStream(
          path.join(directOutput, compose(file)(replaceReservedSymbol, replaceRushienLetter)),
          "utf-8",
        );
        output.pipe(input);
      } else {
        console.log("@@@@@@@@ вложение в директории @@@@@@@@@@@", path.join(directSource, file));
        await start(path.join(directSource, file), path.join(directOutput, file));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/*
module.exports = function copyFolder() {
  outputDir.forEach(e => start(path.join(folder, e), path.join(folder, "dist", e)));
}
*/
