var hashLength = 16;
var debug = true;

function writeCustomPickle(data) {
    var tempString = "";
    var outString = "";
    if ((data.length % hashLength) !== 0) {
        throw "Total cells must be divisble by 16 (or whatever hashLength equals)!";
    }
    for (var d = 0; d < data.length; d++) {
        tempString = tempString + String(data[d].value);
    }

    if (debug) {console.log(tempString);}

    var subString = "";
    var newString = "";
    for (var s = 0; s < (tempString.length / hashLength); s++) {
        subString = tempString.slice((s * hashLength), ((s + 1) * hashLength));
        if (debug) {console.log(subString);}
        newString = parseInt(subString, 2).toString(36);
        if (debug) {console.log(newString);}
        if (outString.length === 0) {
            outString = newString;
        } else {
            outString = outString + "-" + newString;
        }
        newString = "";
    }
    return outString;
}


function readCustomPickle(string, data) {
    var stringArray = string.split('-');
    var binaryString = "";
    var module = "";
    var zeros = "0000000000000000";
    for (var s = 0; s < stringArray.length; s++) {
        module = parseInt(stringArray[s], 36).toString(2);

        // make sure the module has hashLength digits before adding it back in...
        len = module.length;
        if (len < hashLength) {
            module = zeros.slice(0, (hashLength - len)) + module;
        }


        binaryString = binaryString + module;
    }

    // Now convert from binary back into the data structure
    for (var d = 0; d < data.length; d++) {
        if (binaryString[d] === "1") {
            data[d].value = 1;
        } else {
            data[d].value = 0;
        }
    }
    return data;
}


function initData(xDim, yDim, xSize, ySize, hash, xpos, ypos) {
    var data = [];
    var xposInit = 0;
    var yposInit = 0;
    if (xpos !== null) {
        xposInit = xpos;
    }
    if (ypos !== null) {
        yposInit = ypos;
    }
    // console.log("Xpos is");
    // console.log(xpos);
    var x_inc = 0;
    var y_inc = 0;
    var newValue = 0;
    var count = 0;
    var xStep = xSize;
    var yStep = ySize;
    var totalCells = xDim * yDim;
    var maxX = (xDim - 1);
    var maxY = (yDim - 1);
    var tl, tt, tr, ll, rr, bl, bb, br;

    for (var index_n = 0; index_n < totalCells; index_n++)
    {
        // Get the neighbors
        // First the top
        if (y_inc === 0) {
            tl = -1;
            tt = -1;
            tr = -1;
        } else {
            if ((x_inc % (maxX + 1)) === 0) {
                tl = -1;
            } else {
                tl = count - (maxX + 2);
            }
            tt = count - (maxX + 1);
            if (x_inc === maxX) {
                tr = -1;
            } else {
                tr = count - (maxX + 0);
            }
        }

        // Same y_row
        // No need to check -- if x = 0, then n = -1 which is NA value
        ll = count - 1;

        // Check the right bound
        if (x_inc === maxX) {
            rr = -1;
        } else {
            rr = count + 1;
        }

        // Now the bottom
        if (y_inc === maxY) {
            bl = -1;
            bb = -1;
            br = -1;
        } else {
            if ((x_inc % (maxX + 1)) === 0) {
                bl = -1;
            } else {
                bl = count + (maxX + 0);
            }
            bb = count + (maxX + 1);
            if (x_inc === maxX) {
                br = -1;
            } else {
                br = count + (maxX + 2);
            }
        }

        neighbors = [tl, tt, tr, ll, rr, bl, bb, br];

        // Now calculate the positions
        xpos = x_inc * xStep + xposInit;
        ypos = y_inc * yStep + yposInit;

        // Get all the neighbors
        dataItem = {
            value: newValue,
            x: xpos,
            y: ypos,
            ns: neighbors,
            count: count
        };

        // Add it to the array
        data.push(dataItem);

        // Increment the cell count
        count += 1;
        if (x_inc === maxX) {
            x_inc = 0;
            y_inc += 1;
        } else {
            x_inc += 1;
        }

    }
    // If there's a hash, sub that in
    if (hash.length > 0) {
        data = readCustomPickle(hash, data);
    }

    return data;
}


function getNeighbors(cell) {
    var ns = cell.ns;
    var ns2 = [];
    for (var i = 0; i < ns.length; i++) {
        neighbor = ns[i];
        if (neighbor !== -1) {
            ns2.push(neighbor);
        }
    }
    return ns2;
}


function sumNeighbors(cell, data) {
    var ns = getNeighbors(cell);
    var n_count = 0;
    for (var i = 0; i < ns.length; i++) {
        n = ns[i];
        if (data[n].value === 1) {
            n_count += 1;
        }
    }
    return n_count;
}


function conwayStep(data) {
    var n_count = 0;
    var val = 0;
    var comp_data = jQuery.extend(true, [], data); // This is really frustrating in JS...

    // var data_comp = deepCopy(data);

    for (var i = 0; i < comp_data.length; i++) {
        // First get the neighbors
        ns = getNeighbors(data[i]);
        val = comp_data[i].value;

        // Next total the neighbors
        n_count = sumNeighbors(comp_data[i], comp_data);

        // Now apply Conway's rules
        if (val === 1) {
            if (n_count < 2) {
                data[i].value = 0;
            } else if (n_count > 3) {
                data[i].value = 0;
            }
        } else {
            if (n_count === 3) {
                data[i].value = 1;
            }
        }

        // Set neighbor count back to 0
        n_count = 0;
    }

    // Now check that the arrays differ...
    var diff_count = 0;
    for (var i2 = 0; i2 < data.length; i2++) {
        if (data[i2].value !== comp_data[i2].value) {
            diff_count += 1;
        }
    }
    return data;
}


// var strokeColor = null;
var strokeColor = '#444444';
// var color1 = "#d5c1d8";
// var color2 = "#6d5474";
var color1 = "#bdbed8";
var color2 = "#262958";
// var color1 = "#A984B3";
// var color2 = "#5F3E68";

function drawGrid(id, data, xWin, yWin, xCellW, yCellW, transTime, idStart, idStop, idReset, idRandom, idCounter, idSave, idLoad, idTweet, idReloads) {
    var svg = d3.select(id).append("svg")
        .attr("width", xWin)
        .attr("height", yWin)
        .attr("class", "grid");

    var group = svg.append("g");
    var counter = d3.select(idCounter);

    var colorScale = d3.scale.ordinal()
        .range([color1,
              color2
              ]);

    var board = group.selectAll('boxes')
      .data(data)
      .enter()
      .append('rect')
      .attr({
          'height': yCellW,
          'width': xCellW,
          'x': function(d) {
              return d.x;
          },
          'y': function(d) {
              return d.y;
          },
          'fill': function(d,i) {
              return colorScale(d.value);
          },
          'stroke': strokeColor
      })
      .on('click', function() {
          element = d3.select(this);
          val = element.data()[0].value;
          if (val === 0) {
              element.data()[0].value = 1;
              element.attr({'fill': function(d,i) {
                  return colorScale(d.value);
              }});
          } else {
              element.data()[0].value = 0;
              element.attr({'fill': function(d, i) {
                  return colorScale(d.value);
              }});
          }
          if (debug) {console.log("Value is:");}
          if (debug) {console.log(val);}
      });


    var start = d3.select(idStart);

    var control = 0;
    var timer = null;

    start
      .on('click', function() {
          if (control === 0) {
              animStart(timer);
              // Update control
              control = 1;
              if (debug) {console.log("Starting...");}
          } else if (control === 1) {
              if (debug) {console.log("Cannot start -- already running.");}
          }
      });

    var stop = d3.select(idStop);

    stop
      .on('click', function() {
          if (control === 0) {
              // If not running, do nothing
              if (debug) {console.log("Cannot stop -- not running.");}
          } else if (control === 1) {
              // If running
              clearInterval(timer);
              control = 0;
              if (debug) {console.log("Stopped running simulation.");}
          }
      });

    var reset = d3.select(idReset);

    reset
      .on('click', function() {
          if (control === 1) {
              // Stop and reset
              clearInterval(timer);
              control = 0;
              animReset();
              if (debug) {console.log("Stopped and reset.");}
          } else if (control === 0) {
              animReset();
              if (debug) {console.log("Reset already stopped sim.");}
          }
      });

    var random = d3.select(idRandom);

    random
      .on('click', function() {
          if (control === 1) {
              clearInterval(timer);
              control = 0;
              animRandom();
              if (debug) {console.log("Stopped and random data added.");}
          } else if (control === 0) {
              animRandom();
              if (debug) {console.log("Random data replacing stopped board.");}
          }
      });

  var save = d3.select(idSave);

  save
    .on('click', function() {
        if (control === 1) {
            clearInterval(timer);
            control = 0;
            hash = writeCustomPickle(data);
            window.location.hash = hash;
            if (debug) {console.log(hash);}
            if (debug) {console.log("Stopped and saved");}
        } else if (control === 0) {
            hash = writeCustomPickle(data);
            window.location.hash = hash;
            if (debug) {console.log(hash);}
            if (debug) {console.log("Saved data");}
        }
    });

    var load = d3.select(idLoad);

    load
      .on('click', function() {
          if (control === 1) {
              clearInterval(timer);
              control = 0;
              loadData();
              if (debug) {console.log("Stopped and loaded");}
          } else if (control === 0) {
              loadData();
              if (debug) {console.log("Loaded data");}
          }
      });

    var tweet = d3.select(idTweet);

    tweet
      .on('click', function() {
          element = d3.select(this);
          if (control === 1) {
              clearInterval(timer);
              control = 0;
              hash = writeCustomPickle(data);
              window.location.hash = hash;
              href = window.location.href;
              if (hash.length > 0) {
                  href2 = href.split("#");
                  href3 = href2[0] + "%23" + href2[1];
              } else {
                  href3 = href;
              }
              link = "https://twitter.com/intent/tweet?url=" + href3;
              element
                .attr('href', link);
              if (debug) {console.log(href);}
              if (debug) {console.log("Stopped and tweeted");}
          } else if (control === 0) {
              hash = writeCustomPickle(data);
              window.location.hash = hash;
              href = window.location.href;
              console.log(hash);
              console.log(href);
              console.log(hash.length);
              if (hash.length > 0) {
                  href2 = href.split("#");
                  href3 = href2[0] + "%23" + href2[1] + "&";
              } else {
                  href3 = href + "&";
              }
              console.log(href3);
              link = "https://twitter.com/intent/tweet?url=" + href3;
              element
                .attr('href', link);
              if (debug) {console.log(href);}
              if (debug) {console.log("Stopped and tweeted");}
          }
      });

    reloaders = d3.selectAll(idReloads);
    reloaders
      .on('click', function() {
          hash = jQuery(location).attr('hash');
          data = readCustomPickle(hash, data);
          loadData();
      });


    function incrementCounter() {
        txt = counter.text();
        newtxt = String((parseInt(txt, 10) + 1));
        counter
          .text(newtxt);
    }

    function zeroCounter() {
        counter
          .text('0');
    }

    function animStart() {
          var loopCount = 0;
          if (timer) {
              if (debug) {console.log("interval cleared");}
              clearInterval(timer);
          }

          function step() {
              data = conwayStep(data);
              board
                .transition()
                .delay(transTime * 0.1)
                .duration(transTime * 0.9)
                .attr('fill', function(d, i) {
                    return colorScale(d.value);
                });
              incrementCounter();
              loopCount += 1;
          }
          timer = setInterval(step, transTime);
    }

    function animReset() {
        zeroCounter();
        for (var d = 0; d < data.length; d++) {
            data[d].value = 0;
        }
        board
          .transition()
          .delay(0)
          .duration(1000)
          .attr('fill', function(d, i) {
              return colorScale(d.value);
          });
        window.location.hash = "";
    }

    function animRandom() {
        zeroCounter();
        for (var d = 0; d < data.length; d++) {
            data[d].value = d3.round((Math.random() * 0.60));
        }
        board
          .transition()
          .delay(transTime * 0.1)
          .duration(transTime * 0.9)
          .attr('fill', function(d, i) {
              return colorScale(d.value);
          });
    }

    function loadData() {
        zeroCounter();
        hash = jQuery(location).attr('hash');
        if (hash.length !== 0) {
            data = readCustomPickle(hash, data);
            board
              .transition()
              .delay(transTime * 0.1)
              .duration(transTime * 0.9)
              .attr('fill', function(d, i) {
                  return colorScale(d.value);
              });
        }
    }
}

