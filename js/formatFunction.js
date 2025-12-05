/* конвертировать вещественное значение, если там запятая в вещественное с точкой  */
const convertToNumeric = (val) => {
  let regEx = /(?<coma>\,)/g;
  return String(val).replace(regEx, (simb) => {
    let s = "";
    switch (simb) {
      case ",":
        s = ".";
    }
    return s;
  });
};

let getBYN = (type, ...val) => {
  let res = val
    .map((el) => convertToNumeric(String(el)))
    .reduce((prev, cur) => {
      switch (type) {
        case "+":
          return Math.fround(prev) + Math.fround(cur);
        case "-":
          return Math.fround(prev) - Math.fround(cur);
        case "/":
          return prev / cur;
        case "*":
          return prev * cur;
      }
    });
  let cop = /(?<RUB>\d*)(\.|\,)?(?<KOP>\d{0,10})/i.exec(res);
  if (cop === null) {
    return { RUM: 0, KOP: 0 };
  }
  let { RUB, KOP } = cop.groups;
  return { RUB, KOP: Math.abs(KOP.slice(0, 2)) + Math.abs(Math.round(KOP.slice(2, 8) / 10 ** KOP.slice(2, 8).length)) };
};

const regExpClient = /(?<table>\d+)_(?<phone>\+(\d|\s)+)[\s|_]*?_(?<user>[A-Z,А-Я,0-9]+)[\s|_]*(?<htmlOrder>\d+)*/i;
//const regExpClient = /(?<table>\d+)_(?<phone>\+(\d|\s)+)[\s|_]*?_(?<user>[A-Z,А-Я]+)/i;

module.exports = { convertToNumeric, getBYN, regExpClient };
