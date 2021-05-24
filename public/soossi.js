/**
https://github.com/haliphax/ascii.js

The MIT License (MIT)

Copyright (c) 2013 Todd Boyd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
function loadLogo() {
  var logo = document.getElementById("logo");

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4) return;

    var content = xhr.responseText
      .replace(/\r/g, "") // DOS carriage returns
      .replace(/\x1b\[\d*D/g, "") // unsupported ANSI sequences
      .replace(/\x1b\[A\n\x1b\[\d*C/g, "")
      .replace(/\x1a(?:.|\n)*$/, ""); // hide SAUCE

    // if you find \x1b, run it through the ANSI formatter
    if (content.indexOf("\x1b") > -1) {
      content = ansiFormat(content);
    }

    // convert unprintable ASCII characters to their adjusted glyphs

    logo.innerHTML = content; // display
    document.querySelector(".wrapper").className = "wrapper in";
  };

  // pull the file
  xhr.open("GET", "public/images/calexy.ans", true);

  // specify response charset if browser allows it
  if (xhr.overrideMimeType) {
    xhr.overrideMimeType("text/plain; charset=ISO-8859-1");
  }

  xhr.setRequestHeader("Content-Type", "text/plain; charset=ISO-8859-1");
  xhr.send(null);
}

/***
 * replace ANSI SGR and CSI codes with their HTML/CSS equivalents.
 * not all codes are supported; only 8 background and 16 foreground
 * colors in the pallete.
 ***/
function ansiFormat(content) {
  var bg = 0, // background color
    fg = 7, // foreground color
    bold = false, // bold flag
    started = false, // have we started parsing?
    column = 0, // which column are we at?
    copy = content, // temporary buffer of ASCII content
    match, // holds regex matches
    rgx = {
      ansi: /^\x1b\[[^Cm]*[Cm]/, // for stripping all CSI/SGR codes
      sgr: /\x1b\[((?:\d+;?)*)m/, // SGR recognition
    },
    div = document.createElement("div"), // holds elements off-screen
    snippet, // temporary string for building output
    span, // HTML element with current SGR attributes
    transformed = ""; // transformed ASCII
  // loop through ASCII one character at a time and parse SGR/CSI codes
  for (var i = 0; i < content.length; i++) {
    // any SGR/CSI codes?
    try {
      snippet = copy.match(rgx.ansi)[0];
    } catch (ex) {
      snippet = false;
    }

    // yep; parse 'em
    if (snippet) {
      // start appending output after first pass
      if (started == true) {
        span.innerHTML = transformed;
        div.appendChild(span);
      }

      started = true;
      span = document.createElement("span");
      transformed = "";

      // SGR parsing
      if ((match = snippet.match(rgx.sgr))) {
        var params = match[1].split(";");

        for (var j = 0; j < params.length; j++) {
          switch (true) {
            // default
            case params[j] == 0:
              fg = 7;
              bg = 0;
              bold = false;
              break;
            // bold
            case params[j] == 1:
              bold = true;
              break;
            // normal
            case params[j] == 22:
              bold = false;
              break;
            // foreground color
            case params[j] >= 30 && params[j] <= 37:
              fg = params[j] - 30;
              break;
            // normal (fg only)
            case params[j] == 39:
              fg = 7;
              break;
            // background color
            case params[j] >= 40 && params[j] <= 47:
              bg = params[j] - 40;
              break;
            // normal (bg only)
            case params[j] == 49:
              bg = 0;
              break;
            // unrecognized
            default:
              break;
          }
        }

        // "bold" changes color in our case, not font weight
        if (bold == true && fg < 8) {
          fg += 8;
        }
      }

      // apply attributes
      span.setAttribute("class", "bg" + bg + " fg" + fg);
      // strip CSI/SGR
      copy = copy.replace(rgx.ansi, "");
      // continue
      i = content.length - copy.length - 1;
      // nothing to parse; just append output
    } else {
      // newline resets the column counter
      if (content[i] != "\n") {
        column++;
      } else {
        column = 0;
      }

      // append output
      transformed += content[i];
      // remove from buffer
      copy = copy.substring(1);
    }
  }

  span.innerHTML = transformed;
  div.appendChild(span);
  return div.innerHTML;
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var canvas = document.getElementById("background");
var ctx = canvas.getContext("2d");
var charSize = 16;

var w, h, cols, yPos;

function setCanvasSize() {
  w = canvas.width = document.body.offsetWidth;
  h = canvas.height = document.body.offsetHeight;
  cols = Math.floor(w / charSize) + 1;
  yPos = Array(cols).fill(0);
}

setCanvasSize();

window.addEventListener("resize", debounce(setCanvasSize, 50));

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, w, h);

function matrix() {
  ctx.fillStyle = "#0001";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0f0";
  ctx.font = "8px Conv_cp437-8x8";

  yPos.forEach(function (y, index) {
    var char = String.fromCharCode(Math.random() * 128);
    var x = index * charSize;
    ctx.fillText(char, x, y);
    if (y > 100 + Math.random() * 10000) yPos[index] = 0;
    else yPos[index] = y + charSize;
  });
}

window.onload = function () {
  loadLogo();
  setInterval(matrix, 50);
};
