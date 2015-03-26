/** @flow */

function getRelocatable(re: RegExp): RegExp {
  // In the future, this could use a WeakMap instead of an expando.
  if (!(re: any).__matchAtRelocatable) {
    // Disjunctions are the lowest-precedence operator, so we can make any
    // pattern match the empty string by appending `|()` to it:
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-patterns
    var source = re.source + '|()';

    // We always make the new regex global.
    var flags = (
      'g' +
      (re.ignoreCase ? 'i' : '') +
      (re.multiline ? 'm' : '') +
      ((re: any).unicode ? 'u' : '')
      // sticky (/.../y) doesn't make sense in conjunction with our relocation
      // logic, so we ignore it here.
    );

    (re: any).__matchAtRelocatable = new RegExp(source, flags);
  }
  return (re: any).__matchAtRelocatable;
}

function matchAt(re: RegExp, str: string, pos: number): any {
  if (re.global || (re: any).sticky) {
    throw new Error('matchAt(...): Only non-global regexes are supported');
  }
  var reloc = getRelocatable(re);
  reloc.lastIndex = pos;
  var match: Array<string> = reloc.exec(str);
  // Last capturing group indicates our sentinel that indicates whether the
  // regex matched at the given location.
  if (match[match.length - 1] == null) {
    // Original regex matched.
    match.length = match.length - 1;
    return match;
  } else {
    return null;
  }
}

module.exports = matchAt;