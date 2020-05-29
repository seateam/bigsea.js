module.exports = function (mode) {
  if (mode === 'node') {
    return require('./bigsea-node.js')
  } else {
    return require('./bigsea.js')
  }
}
