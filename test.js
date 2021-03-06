/**
 * Usage: node test.js
 */

var mime = require('./mime');
var assert = require('assert');
var path = require('path');

function eq(a, b) {
  console.log('Test: ' + a + ' === ' + b);
  if (typeof(a) === "object" && typeof(a) === typeof(b)) {
    assert(eqArray(a, b));
  } 
  else assert.strictEqual.apply(null, arguments);
}

function eqArray(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; i++) {
    // a[i] and b[i] are obviously not expected to be objects
    if (a[i] !== b[i]) return false;
  }

  return true;
}

console.log(Object.keys(mime.extensions).length + ' types');
console.log(Object.keys(mime.types).length + ' extensions\n');

//
// Test mime lookups
//

eq('text/plain', mime.lookup('text.txt'));     // normal file
eq('text/plain', mime.lookup('TEXT.TXT'));     // uppercase
eq('text/plain', mime.lookup('dir/text.txt')); // dir + file
eq('text/plain', mime.lookup('.text.txt'));    // hidden file
eq('text/plain', mime.lookup('.txt'));         // nameless
eq('text/plain', mime.lookup('txt'));          // extension-only
eq('text/plain', mime.lookup('/txt'));         // extension-less ()
eq('text/plain', mime.lookup('\\txt'));        // Windows, extension-less
eq('application/octet-stream', mime.lookup('text.nope')); // unrecognized
eq('fallback', mime.lookup('text.fallback', 'fallback')); // alternate default

//
// Test extensions
//

eq('txt', mime.extension(mime.types.text));
eq('html', mime.extension(mime.types.htm));
eq('bin', mime.extension('application/octet-stream'));
eq('bin', mime.extension('application/octet-stream '));
eq('html', mime.extension(' text/html; charset=UTF-8'));
eq('html', mime.extension('text/html; charset=UTF-8 '));
eq('html', mime.extension('text/html; charset=UTF-8'));
eq('html', mime.extension('text/html ; charset=UTF-8'));
eq('html', mime.extension('text/html;charset=UTF-8'));
eq('html', mime.extension('text/Html;charset=UTF-8'));
eq(undefined, mime.extension('unrecognized'));

//
// Test extensions with wildcards
//

eq(['appcache','ics','css','csv','html','n3','txt','dsc','rtx','sgml','tsv','t','ttl','uri','vcard','curl','dcurl','scurl','mcurl','sub','fly','flx','gv','3dml','spot','jad','wml','wmls','s','c','f','java','opml','p','nfo','etx','sfv','uu','vcs','vcf','vtt','htc','event-stream','lua','markdown']
  , mime.extension('text/*'));

//
// Test node.types lookups
//

eq('application/font-woff', mime.lookup('file.woff'));
eq('application/octet-stream', mime.lookup('file.buffer'));
eq('audio/mp4', mime.lookup('file.m4a'));
eq('font/opentype', mime.lookup('file.otf'));

//
// Test charsets
//

eq('UTF-8', mime.charsets.lookup('text/plain'));
eq(undefined, mime.charsets.lookup(mime.types.js));
eq('fallback', mime.charsets.lookup('application/octet-stream', 'fallback'));

//
// Test comparison of mime types
//

eq(true, mime.compare('image/*', 'image/png'));
eq(true, mime.compare('image/png', 'image/png'));
eq(false, mime.compare('text/plain', 'text/html'));
eq(false, mime.compare('text/*', 'audio/*'));
eq(true, mime.compare('*', 'application/json'));
eq(true, mime.compare('*', 'application/*'));
eq(true, mime.compare('*', '*/*'));
eq(true, mime.compare('*', '*'));
eq(false, mime.compare('asd/asd', '*'));

//
// Test for overlaps between mime.types and node.types
//

var apacheTypes = new mime.Mime(), nodeTypes = new mime.Mime();
apacheTypes.load(path.join(__dirname, 'types/mime.types'));
nodeTypes.load(path.join(__dirname, 'types/node.types'));

var keys = [].concat(Object.keys(apacheTypes.types))
             .concat(Object.keys(nodeTypes.types));
keys.sort();
for (var i = 1; i < keys.length; i++) {
  if (keys[i] == keys[i-1]) {
    console.warn('Warning: ' +
      'node.types defines ' + keys[i] + '->' + nodeTypes.types[keys[i]] +
      ', mime.types defines ' + keys[i] + '->' + apacheTypes.types[keys[i]]);
  }
}

console.log('\nOK');
