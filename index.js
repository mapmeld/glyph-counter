const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

function analyzeText(text, callback) {
  var counts_by_glyph = {};

  var accents_and_vowels = "[:\u0300-\u036F\u0902\u093E-\u0944\u0947\u0948\u094B\u094C\u0962\u0963\u0981\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB\u09CC\u09D7\u09E2\u09E3\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u102B-\u1032\u1036-\u1038\u103A-\u103E\u1056-\u1059\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]";
  var combo_characters = "[\u094D\u09CD\u1039]";

  while (text.length) {
    while (text.charCodeAt(0) < 500) {
      text = text.substring(1);
    }
    if (text.length) {
      var startChar = text[0];
      var blockFinder = startChar + "(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(" + accents_and_vowels + ")?)?";
      var block = (new RegExp(blockFinder)).exec(text)[0];
      counts_by_glyph[block] = (counts_by_glyph[block] || 0) + 1;
      text = text.substring(block.length);
    }
  }
  var glyphs = Object.keys(counts_by_glyph);
  glyphs.sort(function(a, b) {
    if (a[0] === b[0]) {
      return counts_by_glyph[b] - counts_by_glyph[a];
    } else {
      return a.charCodeAt(0) - b.charCodeAt(0);
    }
  });
  var sorted_counts = {};
  for (var a = 0; a < glyphs.length; a++) {
    sorted_counts[glyphs[a]] = counts_by_glyph[glyphs[a]];
  }
  callback(null, sorted_counts);
}

function analyzeArticle(url, callback) {
  request(url, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    var $ = cheerio.load(body);
    var article = $("#content").text();
    analyzeText(article, callback);
  });
}

analyzeArticle('https://my.wikipedia.org/wiki/%E1%80%99%E1%80%BC%E1%80%94%E1%80%BA%E1%80%99%E1%80%AC%E1%80%95%E1%80%BC%E1%80%8A%E1%80%BA', function (err, counts_by_glyph) {
  if (err) {
    throw err;
  }
  console.log(counts_by_glyph);
});
