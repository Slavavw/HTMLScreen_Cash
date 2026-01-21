const replaceReservedSymbol = (str) => {
  let regEx = /(?<space>[%\s])|(?<amp>&)|(?<lt><)|(?<gt>>)|(?<apos>')|(?<quote>")/g;
  return str.replace(regEx, (simb, index) => {
    let s = '';
    switch (simb) {
      case "%": s = "";
      case " ": s = ""; break;
      case "&": s = "&amp;"; break;
      case "<": s = "&lt;"; break;
      case ">": s = "&gt;"; break;
      case "?": s = "&apos;"; break;
      default: s = "&quote;";
    }
    return s;
  })
  /*return ([...str].map(v => v.replace("&", "&amp;").replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace('"', "&quot;").replace("'", "&#39;")
    .replace("%", " ").replace(" ", "").replace("(", "").replace(")", ""))
    .join(""));*/
}
const generateArrayLetter = (arr) => arr.map(code => String.fromCharCode(code));

const compose = (arg) => (...func) => func.reduce((prev, f) => f(prev), arg);

const generater = (fierst = "А", last = "я") => {
  let length = [fierst, last].map(str => str.codePointAt(0))
    .reduce((prev, cur) => cur - prev, 0) + 1;
  return () => Array.from({ length }, (value, index) => fierst.codePointAt(0) + index)
}


const rusLetter = [...generateArrayLetter(generater("а", "я")()), ...generateArrayLetter(generater("А", "Я")())];
const engLetter = [...generateArrayLetter(generater("a", "z")()), ...generateArrayLetter(generater("A", "Z")())];

const replaceRushienLetter = (arg) => arg.replace(/[а-яА-Я]/g, (simb, index) => {
  let curIndex = rusLetter.indexOf(simb);
  return engLetter[curIndex > engLetter.length ? engLetter.length - curIndex : curIndex];
}) 

module.exports = { compose, replaceReservedSymbol, replaceRushienLetter };

