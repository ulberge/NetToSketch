(function() {
  // const canvasSizeX = 16;
  // const canvasSizeY = 16;

  // const scale = 20;

  // const outputSizes = [16, 16];
  // const selectionColors = ['#A74661', '#956C89', '#8490B0', '#71B6D7', '#67CBEF'];
  // const sketches = {
  //   stored: null,
  //   temp: null,
  //   comp: null,
  //   debug: null,
  //   stored_scaled: null,
  //   input: null,
  //   layers: null
  // };

  // sketch_a_net.drawFilters();
  // const modelLayers = sketch_a_net.loadLayers();

  // function format(imgArr) {
  //   const gray = [];
  //   for (let i = 0; i < imgArr.length; i += 4) {
  //     gray.push(1 - (imgArr[i] / 255));
  //   }
  //   const gray_f = nj.array(gray).reshape(outputSizes[0], outputSizes[0]);
  //   return gray_f.tolist();
  // }

  // function onChange() {
  //   // write temp to stored
  //   const temp = sketches.temp.get();
  //   sketches.stored.image(temp, 0, 0);
  //   sketches.temp.clear();

  //   // run network
  //   const input = sketches.stored.get();
  //   const sketchSize = outputSizes[0];
  //   input.resize(16, 16);
  //   const inputSketch = sketches.input;
  //   inputSketch.image(input, 0, 0);
  //   inputSketch.loadPixels();
  //   const imgArr = format(inputSketch.pixels);
  //   console.log(imgArr);

  //   const layerOutputs = sketch_a_net.evalLayers(imgArr, modelLayers);
  //   // delayed so tf can build model
  //   console.log('Layer Outputs', layerOutputs);
  //   sketches.layers = [];
  //   sketch_a_net.drawOutputs(layerOutputs, sketches);

  //   net_to_sketch.run(sketches, scale, modelLayers, layerOutputs);

  //   layers.drawPicture()
  // }



  // Create sketches and store on given sketches object
  async function createSketches(state, onChange) {
    return new Promise((resolve) => {
      const canvasSizeX = state.scales.canvas.size[0];
      const canvasSizeY = state.scales.canvas.size[1];
      const scale = state.scales.canvas.scale;

      function sketch_input(p) {
        state.sketches.input = p;

        p.setup = function setup() {
          p.pixelDensity(1);
          p.createCanvas(canvasSizeX, canvasSizeY);
          p.background(255);
          p.noLoop();
        };
      }
      new p5(sketch_input, $('#layer_input')[0]);

      function getOutputSketch(layer_i) {
        return (p) => {
          const sketchSize = state.scales.layers[layer_i].size;
          const scale = state.scales.layers[layer_i].scale;

          p.setup = function setup() {
            p.pixelDensity(1);
            p.createCanvas(sketchSize * scale, sketchSize * scale);
            p.background(255);
            p.noLoop();
            p.noStroke();
          };

          p.draw = function draw() {}
        };
      }

      state.sketches.layers = []
      const L1_sketches = [];
      $('#layer_L1 .outputs').append('<td><div class="output0"></div></td>');
      L1_sketches.push(new p5(getOutputSketch(0), $('#layer_L1 .output0')[0]));
      $('#layer_L1 .outputs').append('<td><div class="output1"></div></td>');
      L1_sketches.push(new p5(getOutputSketch(0), $('#layer_L1 .output1')[0]));
      state.sketches.layers.push(L1_sketches);

      const L2_sketches = [];
      $('#layer_L2 .outputs').append('<td><div class="output0"></div></td>');
      L2_sketches.push(new p5(getOutputSketch(1), $('#layer_L2 .output0')[0]));
      $('#layer_L2 .outputs').append('<td><div class="output1"></div></td>');
      L2_sketches.push(new p5(getOutputSketch(1), $('#layer_L2 .output1')[0]));
      $('#layer_L2 .outputs').append('<td><div class="output2"></div></td>');
      L2_sketches.push(new p5(getOutputSketch(1), $('#layer_L2 .output2')[0]));
      $('#layer_L2 .outputs').append('<td><div class="output3"></div></td>');
      L2_sketches.push(new p5(getOutputSketch(1), $('#layer_L2 .output3')[0]));
      state.sketches.layers.push(L2_sketches);

      const L3_sketches = [];
      $('#layer_L3 .outputs').append('<td><div class="output0"></div></td>');
      L3_sketches.push(new p5(getOutputSketch(2), $('#layer_L3 .output0')[0]));
      state.sketches.layers.push(L3_sketches);

      function sketch_animation(p) {
        state.sketches.animation = p;
        const containerNetworkAnimation = $('#network_animation');
        const w = $(containerNetworkAnimation).width();
        const h = $(containerNetworkAnimation).height();

        p.setup = function setup() {
          p.createCanvas(w, h);
          p.noLoop();
        };

        p.draw = function draw() {};
      }
      new p5(sketch_animation, $('#sketch_networkAnimation')[0]);

      function sketch_stored(p) {
        state.sketches.stored = p;

        p.setup = function setup() {
          p.pixelDensity(1);
          p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
          p.background(255);
        };

        p.draw = function draw() {};
      }
      new p5(sketch_stored, document.getElementById('sketch_stored'));

      function sketch_comp(p) {
        state.sketches.comp = p;

        p.setup = function setup() {
          p.pixelDensity(1);
          p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
          p.noLoop();
        };

        p.draw = function draw() {};
      }
      new p5(sketch_comp, document.getElementById('sketch_comp'));

      function sketch_debug(p) {
        state.sketches.debug = p;

        p.setup = function setup() {
          p.pixelDensity(1);
          p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
          p.noLoop();
        };

        p.draw = function draw() {
        };
      }
      new p5(sketch_debug, document.getElementById('sketch_debug'));

      function sketch_temp(p) {
        state.sketches.temp = p;
        let inChange = true;

        p.setup = function setup() {
          p.pixelDensity(1);
          p.createCanvas(canvasSizeX * scale, canvasSizeY * scale);
          resolve();
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

              // const dist = Math.max(Math.abs(xEnd - xStart), Math.abs(yEnd - yStart)) + 1;
              // for (let i = 0; i <= dist; i += 1) {
                // const xCur = Math.floor((xStart + (((xEnd - xStart) / dist) * i)) / scale);
                // const yCur = Math.floor((yStart + (((yEnd - yStart) / dist) * i)) / scale);
              //   p.rect(xCur * scale, yCur * scale, scale, scale);
              // }
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
            if (px === 0 && py === 0) {
              return;
            }
            const xCur = Math.floor(px / scale);
            const yCur = Math.floor(py / scale);
            const c = state.sketches.stored.get(px, py);
            const r = c[0];
            if (r !== 0) {
              p.fill(p.color(0, 0, 0, 255));
            } else {
              p.fill(p.color(255, 255, 255, 255));
            }
            p.rect(xCur * scale, yCur * scale, scale, scale);

            onChange();
            inChange = false;
          }
        };
      }
      new p5(sketch_temp, document.getElementById('sketch_temp'));
    });
  }

  window.create_sketches = {
    createSketches
  };
}());
