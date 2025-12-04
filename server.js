const colors = require("colors");
const http = require("http");
const fs = require("fs");
const stat = require("fs/promises").stat;
const path = require("path");
const url = require("url");
const mime = require("mime");
require("@babel/register")({ presets: ["@babel/env", "@babel/react"] });
const React = require("react");
const ReactDOMServer = require("react-dom/server");

const { IntervalServer, ServerPort } = require(path.join(__dirname, "serverinterval.json"));

const replaceReservedSymbol = (str) => {
  let regEx = /(?<space>[%\s])|(?<amp>&)|(?<lt><)|(?<gt>>)|(?<apos>')|(?<quote>")/g;
  return str.replace(regEx, (simb, index) => {
    let s = "";
    switch (simb) {
      case "%":
        s = "";
      case " ":
        s = "";
        break;
      case "&":
        s = "&amp;";
        break;
      case "<":
        s = "&lt;";
        break;
      case ">":
        s = "&gt;";
        break;
      case "?":
        s = "&apos;";
        break;
      default:
        s = "&quote;";
    }
    return s;
  });
};
const generateArrayLetter = (arr) => arr.map((code) => String.fromCharCode(code));

const compose =
  (arg) =>
  (...func) =>
    func.reduce((prev, f) => f(prev), arg);

const generater = (fierst = "А", last = "я") => {
  let length = [fierst, last].map((str) => str.codePointAt(0)).reduce((prev, cur) => cur - prev, 0) + 1;
  return () => Array.from({ length }, (value, index) => fierst.codePointAt(0) + index);
};

const rusLetter = [...generateArrayLetter(generater("а", "я")()), ...generateArrayLetter(generater("А", "Я")())];
const engLetter = [...generateArrayLetter(generater("a", "z")()), ...generateArrayLetter(generater("A", "Z")())];

const replaceRushienLetter = (arg) =>
  arg.replace(/[а-яА-Я]/g, (simb, index) => {
    let curIndex = rusLetter.indexOf(simb);
    return engLetter[curIndex > engLetter.length ? engLetter.length - curIndex : curIndex];
  });

//*********************todo перезаписали в папку dist файлы с папок audio, image, css, audio**************************
const fs_promise = fs.promises;

const outputDir = [];
console.clear();

(function () {
  Promise.race(outputDir.map((e) => start(path.join(__dirname, e), path.join(__dirname, "dist", e))));
})();

async function start(direct, directOutput) {
  try {
    await fs.exists(directOutput, async (exit) => {
      if (!exit) {
        fs.mkdir(directOutput, { recursive: true }, async (err) => {
          if (err) throw err;
          await readFileInDir(direct, directOutput);
        });
      } else {
        let dirDeleted = await reamovecatalog(directOutput);
        await start(direct, dirDeleted);
      }
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
        fs.promises.unlink(newdir);
      } else await reamovecatalog(newdir);
    }
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
        //console.log(`####создаем файл:#########${path.join(directOutput, file)}`.magenta);
        let output = fs.createReadStream(path.join(directSource, file));
        let input = fs.createWriteStream(
          path.join(directOutput, compose(file)(replaceReservedSymbol, replaceRushienLetter)),
          "utf-8"
        );
        output.pipe(input);
      } else {
        await start(path.join(directSource, file), path.join(directOutput, file));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
//*******************end*****************************/

//todo подключаем компиляцию на ходу из JSX в JS React
//todo для импортирования JSX после установки babel-register и babel-preset-react из npm:
const cb = (err) => {
  throw err;
};

//создали для рендеринга на стороне сервера React element
const ErrorBundle = function (message) {
  return React.createElement(
    require("./jsx/errorBundle.jsx"),
    { message: message, width: "200px", height: "100px" },
    React.createElement(
      require("./jsx/animationCircle.jsx"),
      {
        width: "500px",
        height: "100px",
        style: { position: "absolute", left: 50, zIndex: "-10000" },
        speed: "1000 / 24",
      },
      null
    )
  );
};

const PORT = ServerPort || 5000;
const os = require("os");
const IPv4 =
  Object.entries(os.networkInterfaces())
    .flat(5)
    .filter((e) => e instanceof Object)
    .filter((e) => e.family.match(/^ipv4/i) && !e.internal)
    .map((e) => e.address)[0] || "localhost";

console.log(IPv4);

//const menu_titles = require("./menu_titles.json");

let server = new http.Server();
server.listen(PORT, IPv4, () => console.log(`Сервер запущен по адреcу: http://${IPv4}:${PORT}`.bgBrightGreen));

async function CreateOrderFolder(folder) {
  try {
    await fs.exists(folder, async (exit) => {
      if (!exit) {
        return fs.mkdir(folder, { recursive: true }, async (err) => {
          if (err) throw err;
          console.log("должен создасться каталог ", folder);
        });
      } else return true;
    });
  } catch (e) {
    console.log("ошибка создания каталдога:", e);
    throw err;
  }
}

server.on("request", (request, response) => {
  let pathname = url.parse(request.url).pathname;
  const menu_titles = require("./menu_titles.json");
  let menu = require("./menu.json");
  if (request.method === "GET") {
    let filePath = path.join(__dirname, compose(request.url)(replaceRushienLetter, replaceReservedSymbol));
    if (pathname === "/") {
      const streamRead = fs.createReadStream(path.join(__dirname, "dist", "index.html"));
      var dataBuffer = [];
      streamRead.on("data", (chunk) => {
        dataBuffer = dataBuffer.concat(...chunk);
      });
      streamRead.on("error", (err) => {
        let result = Buffer.from(dataBuffer)
          .toString()
          .replace(
            /\<body\>.{1,}\<\/body\>/s,
            `<body>          
          <div id='content'></div>
          <script>
          ReactDOM.render(${ReactDOMServer.renderToString(ErrorBundle())},document.getElementById("content"));
          </script>          
          </body>`
          );
        if (err.code === "ENOENT") {
          response.writeHead(404, { "content-type": "text/html; chatset=utf-8" });
          response.end(result);
        } else {
          response.statusCode = 500;
          response.end(result);
        }
        console.log(err);
      });
      streamRead.on("end", async () => {
        await response.writeHead(200, { "content-type": "text/html; chatset=utf-8" });
        let styleBkground =
          '<style type="text/css">body{background-image:url(/images/background/background.jpg);}</style>';
        stat(path.join(__dirname, "images", "background", "background.jpg"))
          .catch(() => {
            styleBkground = '<style type="text/css">body{background-image:url(/images/background_main.jpg);}</style>';
          })
          .finally(() => {
            let interval;
            stat(path.join(__dirname, "serverinterval.json"))
              .then((state) => {
                interval = IntervalServer;
              })
              .catch(() => {
                interval = 5000;
              })
              .finally(() => {
                let funcInterval = `<script>
                  const updateSheet = (function () {
                  console.log(${interval});
                  let count = 0;
                  return () => {
                    if (document.querySelector(".intervel_link".concat(count))) {
                      document.querySelector(".intervel_link".concat(count)).click();
                      console.log(count,${menu_titles.length});
                      count++;
                      if (count > ${menu_titles.length}-1) count = 0;
                    }
                  };
                })();
                window.setInterval(updateSheet, ${interval});
                </script>`;

                let result = Buffer.from(dataBuffer)
                  .toString()
                  .replace(
                    /<body>/i,
                    `<body>`
                      .concat(styleBkground)
                      .concat(`<script>const menu_titles = ${JSON.stringify(menu_titles)};</script>`)
                      .concat(funcInterval)
                  );
                console.log(result.bgMagenta);
                response.write(result);
                response.end();
              });
          });
      });
    } else if (pathname === "/menu_titles") {
      response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(menu_titles));
    } else if (/menu\/[0-9]+/.test(pathname)) {
      let id = /[0-9]+/.exec(pathname)[0];
      let arr = menu[id][`${menu_titles[id].title}`];
      console.log("id = ", id);
      console.log(JSON.stringify(arr).bgCyan);
      response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(arr));
      JSON.stringify(arr);
    } else if (pathname === "/animation_img/library") {
      let pathLibreryPict = path.join(__dirname, "dist", "images", "library");
      let res = [];
      fs.readdir(pathLibreryPict, (err, files) => {
        if (err) cb(err);
        for (let file of files) {
          res.push(path.join("dist", "images", "library", file));
        }
        console.log(res.join("\n\t").america);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(res));
      });
    } else {
      console.log(filePath.red);
      fs.exists(filePath, (ext) => {
        if (ext) {
          let readStream = fs.createReadStream(filePath);
          var dataBuffer = [];
          response.writeHead(200, {
            "content-type": mime.getType(path.basename(filePath)),
          });
          //      readStream.pipe(response);
          readStream.on("data", (chunk) => {
            dataBuffer = [...dataBuffer, chunk];
            response.write(chunk);
          });
          readStream.on("end", () => response.end());
        } else {
          console.error("mistake:", filePath.bgRed);
          response.end();
        }
      });
    }
  }
  //POST
  else {
    var dataBuffer = [];
    if (pathname === "/order") {
      request
        .on("data", (chunk) => {
          dataBuffer = dataBuffer.concat(...chunk);
        })
        .on("end", () => {
          let filename = String(Date.now()).slice(-7);
          console.log(filename.america);
          CreateOrderFolder(path.join(__dirname, "order"))
            .then((res) => {
              console.log("создан каталог");
              //! запишем заказ в файл и сохраним в каталог  order
              let stream = fs.createWriteStream(path.join(__dirname, "order", `${filename}.json`), "utf-8");
              stream.end(Buffer.from(dataBuffer).toString(), "utf-8", () => {
                console.log("записан в файл", Buffer.from(dataBuffer).toString().america);
                response.writeHead(200, { "content-type": "application/json" });
                let resp = Object.assign({}, { check: `${filename}` });
                console.log(JSON.stringify(resp).bgRed);
                response.end(JSON.stringify(resp));
              });
            })
            .catch((err) => {
              response.writeHead(404, { "content-type": "text/html; chatset=utf-8" });
              response.end(ReactDOMServer.renderToString(ErrorBundle("ошибка создания каталога заказов")));
            });
        })
        .on("error", () => {
          let message = 'message={"ошибка передачи заказа, попробуйте еще"}';
          let result = ReactDOMServer.renderToString(ErrorBundle(`${message}`));
          response.writeHead(404, { "content-type": "text/html; chatset=utf-8" });
          response.end(result);
        });
    }
  }
});

server.on("close", () => {
  console.log("===================close server listerner=================\t\n".america);
});
