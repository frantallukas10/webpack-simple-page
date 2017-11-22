const css = require('./src/styles/_base.scss');
function importAll(r) {
  return r.keys().map(r);
}
const images = importAll(require.context('./src/styles/images/', false, /\.(png|jpe?g|tif|gif|svg)$/));
const fonts = importAll(require.context('./src/styles/fonts/', false, /\.(woff|woff2|ttf|eot|svg)$/));

console.log('')

if (module.hot) {
  module.hot.accept()
}