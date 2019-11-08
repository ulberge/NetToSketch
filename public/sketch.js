(function() {
  const canvasSizeX = 16;
  const canvasSizeY = 16;

  const scale = 20;

  const outputSizes = [16, 16];
  const selectionColors = ['#A74661', '#956C89', '#8490B0', '#71B6D7', '#67CBEF'];
  const sketches = {
    stored: null,
    temp: null,
    debug: null,
    stored_scaled: null,
    layers: [
      []
    ]
  };

  sketch_a_net.drawFilters();
  const modelLayers = sketch_a_net.loadLayers();

  function format(imgArr) {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(outputSizes[0], outputSizes[0]);
    return gray_f.tolist();
  }

  function onChange() {
    // write temp to stored
    const temp = sketches.temp.get();
    sketches.stored.image(temp, 0, 0);
    sketches.temp.clear();

    // run network
    const input = sketches.stored.get();
    const sketchSize = outputSizes[0];
    input.resize(16, 16);
    const inputSketch = sketches.layers[0][0];
    inputSketch.image(input, 0, 0);
    inputSketch.loadPixels();
    const imgArr = format(inputSketch.pixels);
    console.log(imgArr);

    const layerOutputs = sketch_a_net.evalLayers(imgArr, modelLayers);
    console.log(layerOutputs);
    sketch_a_net.drawOutputs(layerOutputs);
  }

  function getNetworkSketch(layer_i, i) {
    return (p) => {
      sketches.layers[layer_i][i] = p;
      const sketchSize = outputSizes[layer_i];

      p.setup = function setup() {
        p.pixelDensity(1);
        p.createCanvas(sketchSize, sketchSize);
        p.background(255);
        p.noLoop();
      };
    };
  }
  new p5(getNetworkSketch(0, 0), $('#layer_input .outputs')[0]);

  function sketch_stored(p) {
    sketches.stored = p;

    p.setup = function setup() {
      p.pixelDensity(1);
      p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
      p.background(255);
    };

    p.draw = function draw() {
      //use esc to empty canvas
      if (p.keyIsPressed) {
        if (p.keyCode == p.ESCAPE) {
          p.background(255);
        }
      }
    };
  }
  new p5(sketch_stored, document.getElementById('sketch_stored'));

  function sketch_temp(p) {
    sketches.temp = p;
    let inChange = true;

    p.setup = function setup() {
      p.pixelDensity(1);
      p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
    };

    p.draw = function draw() {
      p.fill(0);
      // p.stroke(0);
      // p.strokeWeight(scale);
      p.noStroke();

      // Record mouse pressed events within canvas
      const px = p.pmouseX;
      const py = p.pmouseY;
      const x = p.mouseX;
      const y = p.mouseY;
      if (!(x < 0 || y < 0 || px < 0 || py < 0 || x >= p.width || px >= p.width || y >= p.height || py >= p.height)) {
        if (p.mouseIsPressed) {
          const xStart = px;
          const yStart = py;
          const xEnd = x;
          const yEnd = y;

          const dist = Math.max(Math.abs(xEnd - xStart), Math.abs(yEnd - yStart)) + 1;
          for (let i = 0; i <= dist; i += 1) {
            const xCur = Math.floor((xStart + (((xEnd - xStart) / dist) * i)) / scale);
            const yCur = Math.floor((yStart + (((yEnd - yStart) / dist) * i)) / scale);
            console.log(xCur, yCur);
            p.rect(xCur * scale, yCur * scale, scale, scale);
          }
          // for (let yCur = yStart; yCur <= yEnd; yCur += 1) {
          //   for (let xCur = xStart; xCur <= xEnd; xCur += 1) {
          //     console.log(xCur * scale, yCur * scale, scale, scale);
          //     p.rect(xCur * scale, yCur * scale, scale, scale);
          //   }
          // }
          // // draw line
          // p.line(px, py, x, y);
          inChange = true;
        }
      }
      // If mouse is not pressed, and it was being pressed at the last draw, trigger on change and clear
      if (!p.mouseIsPressed && inChange) {
        onChange();
        inChange = false;
      }
    };
  }
  new p5(sketch_temp, document.getElementById('sketch_temp'));

  function sketch_debug(p) {
    sketches.debug = p;

    p.setup = function setup() {
      p.pixelDensity(1);
      p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
      p.noLoop();
    };

    p.draw = function draw() {
    };
  }
  new p5(sketch_debug, document.getElementById('sketch_debug'));

}());
