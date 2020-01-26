(function() {
  /**
  * Helper Functions
  */
  /*
  * Pauses the execution loop to allow animation of action.
  */
  async function pause(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

  // Returns a table of the maximum activation possible by location
  function getPossibleTable(filter, maxAct) {
    return filter.map(row => row.map(item => maxAct * (item > 0 ? item : 0)));
  }

  // Returns the total improvement remaining and the remainder by position
  function getRemainderTable(acts, scope, possibleTable) {
    const remainderTable = possibleTable.map((row, y) => row.map((possible, x) => {
      if (possible === 0) {
        return 0;
      }

      const act = Math.max(0, acts[scope[0].y + y][scope[0].x + x]);
      // Should always be below 1, but hard to calculate...
      // const ratio = Math.min(1, act / possible);
      // return 1 - ratio;
      return Math.max(0, possible - act);
    }));

    return remainderTable;
  }

  function getRemainderInfos(state, filterGroups, acts, layerIndex) {
    // For each filter, consider the activations within the scope
    const scope = state['L' + (layerIndex + 1)].scope;
    const possibleTables = filterGroups.map(filterGroup => filterGroup.map(filter => {
      return getPossibleTable(filter, state.maxActs[layerIndex]);
    }));
    const remainderTables = filterGroups.map((filterGroup, i) => filterGroup.map((filter, j) => {
      const possibleTable = possibleTables[i][j];
      return getRemainderTable(acts[j], scope, possibleTable);
    }));
    // Normalize across totals and tables
    // Get total sum remaining at this layer
    let sum = 0;
    remainderTables.forEach(group => group.forEach(table => table.forEach(row => row.forEach(v => sum += v))));
    if (sum === 0) {
      sum = 1;
    }
    const remainderTables_norm = remainderTables.map(group => group.map(table => table.map(row => row.map(v => v / sum))));

    // Get totals
    const remainderInfos = remainderTables_norm.map((group, i) => group.map((remainderTable, j) => {
      let remainder = 0;
      remainderTable.forEach(row => row.forEach(v => remainder += v));

      let remainder_abs = 0;
      remainderTables[i][j].forEach(row => row.forEach(v => remainder_abs += v));

      let possible = 0;
      possibleTables[i][j].forEach(row => row.forEach(v => possible += v));
      return { remainder, remainderTable, remainder_abs, remainderTable_abs: remainderTables[i][j], possible, possibleTable: possibleTables[i][j] };
    }));

    return remainderInfos;
  }

  // Get position below by calculating padding from kernel size
  function getPos(state, layerAbovePos, layerIndex) {
    // Kernel size bewteen outputs
    const kernelSize = state.modelLayers[layerIndex + 1].kernelSize[0];
    const pad = (kernelSize - 1) / 2;
    const [ start, end ] = layerAbovePos;
    const posBelow = [ new Vec2(start.x - pad, start.y - pad), new Vec2(end.x + pad, end.y + pad) ];
    return posBelow;
  }

  function tensorToArray(tensor) {
    let arr = nj.array(tensor);
    arr = arr.transpose(3, 2, 0, 1);
    return arr.tolist();
  }

  function normalize(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      return arr.map(v => (1 / arr.length));
    }
    return arr.map(v => (v / sum));
  }

  function choose1D(arr) {
    const arr_n = normalize(arr);
    const selector = Math.random();
    let cursor = 0;
    for (let i = 0; i < arr_n.length; i += 1) {
      cursor += arr_n[i];
      if (selector <= cursor) {
        return i;
      }
    }
  }

  function choose2D(arr) {
    const h = arr.length;
    const w = arr[0].length;
    const arr_f = arr.flat();
    const arr_n = normalize(arr_f);
    const selector = Math.random();
    let cursor = 0;
    for (let i = 0; i < arr_n.length; i += 1) {
      cursor += arr_n[i];
      if (selector <= cursor) {
        const y = Math.floor(i / w);
        const x = i % w;
        return { x, y };
      }
    }
  }

  function updateCalculationsL3(state) {
    const layerIndex = 2;
    const acts = state.layerOutputs[layerIndex];

    // Get the remaining activations possible
    // Filter is just all of one point
    const filters = [[[[1]]]];
    state.L3.remainderInfo = getRemainderInfos(state, filters, acts, layerIndex)[0];
  }

  function L3(state) {
    console.log('run L3');
    // We want a square (also known as L_2_0) at L_2_0:pos
    const pos = new Vec2(Math.floor(Math.random() * 12) + 2, Math.floor(Math.random() * 12) + 2);
    // For L3, total, scope and selection are all the same
    // The total area that could possibly be updated at this layer by this action
    state.L3.total = [pos, pos];
    state.L2.total = getPos(state, state.L3.total, 1);
    state.L1.total = getPos(state, state.L2.total, 0);
    state.L0.total = getPos(state, state.L1.total, -1);

    // The area that is being considered for improvement at this layer
    state.L3.scope = [pos, pos];
    // The position chosen for improvement
    state.L3.selection = [pos, pos];
    state.L3.filterToImprove = 0;
    updateCalculationsL3(state);
  }

  function isL3Done(state) {
    console.log('run isL3Done');
    updateCalculationsL3(state);

    const isDone = state.L3.remainderInfo[0].remainder_abs <= state.layerGoals[1];
    console.log(state.L3.remainderInfo[0].remainder_abs + ' > ' + state.layerGoals[2] + '?', 'isL3Done: ' + isDone, '' + state.L3.remainderInfo[0].remainderTable_abs);
    return isDone;
  }

  function updateCalculationsL2(state) {
    const layerIndex = 1;
    const layerName = 'L' + (layerIndex + 1);
    const L = state[layerName];
    const acts = state.layerOutputs[layerIndex];

    // The area that is being considered for improvement at this layer
    const layerNameAbove = 'L' + (layerIndex + 2);
    L.scope = getPos(state, state[layerNameAbove].selection, layerIndex);

    // For each filter, consider the activations within the scope
    const filters = state.filters[layerIndex + 1];
    L.remainderInfo = getRemainderInfos(state, filters, acts, layerIndex)[state.L3.filterToImprove];

    // Choose a filter with probability equal to normalized remaining potential
    state.L2.filterToImprove = choose1D(state.L2.remainderInfo.map(info => info.remainder));

    // Choose pos in filter to improve
    const posToImprove = choose2D(state.L2.remainderInfo[state.L2.filterToImprove].remainderTable);
    const posToImproveVec = new Vec2(state.L2.scope[0].x + posToImprove.x, state.L2.scope[0].y + posToImprove.y);
    state.L2.selection = [posToImproveVec, posToImproveVec];
  }

  function L2(state) {
    console.log('run L2');
    updateCalculationsL2(state);
  }

  function isL2Done(state) {
    console.log('run isL2Done');
    updateCalculationsL2(state);

    const L = state['L2'];
    const filterIndex = L.filterToImprove;
    const info = L.remainderInfo[filterIndex];
    const isDone = info.remainder_abs <= state.layerGoals[1];
    console.log(info.remainder_abs + ' > ' + state.layerGoals[1] + '?', isDone + ': isL2Done for filter=' + filterIndex + ' at pos=' + L.selection, '' + info.remainderTable_abs);
    return isDone;
  }

  function updateCalculationsL1(state) {
    const layerIndex = 0;
    const layerName = 'L' + (layerIndex + 1);
    const L = state[layerName];
    const acts = state.layerOutputs[layerIndex];

    // The area that is being considered for improvement at this layer
    const layerNameAbove = 'L' + (layerIndex + 2);
    L.scope = getPos(state, state[layerNameAbove].selection, layerIndex);

    // For each filter, consider the activations within the scope
    const filters = state.filters[layerIndex + 1];
    L.remainderInfo = getRemainderInfos(state, filters, acts, layerIndex)[state.L2.filterToImprove];

    // Choose a filter with probability equal to normalized remaining potential
    L.filterToImprove = choose1D(L.remainderInfo.map(info => info.remainder));

    // Choose pos in filter to improve
    const posToImprove = choose2D(L.remainderInfo[L.filterToImprove].remainderTable);
    const posToImproveVec = new Vec2(L.scope[0].x + posToImprove.x, L.scope[0].y + posToImprove.y);
    L.selection = [posToImproveVec, posToImproveVec];
  }

  function L1(state) {
    console.log('run L1');
    updateCalculationsL1(state);
  }

  function isL1Done(state) {
    console.log('run isL1Done');
    updateCalculationsL1(state);

    const L = state['L1'];
    const filterIndex = L.filterToImprove;
    const info = L.remainderInfo[filterIndex];
    const isDone = info.remainder_abs <= state.layerGoals[0];
    console.log(info.remainder_abs + ' > ' + state.layerGoals[0] + '?', isDone + ': isL1Done for filter=' + filterIndex + ' at pos=' + L.selection, '' + info.remainderTable_abs);
    return isDone;
  }

  function updateCalculationsL0(state) {
    const L = state['L0'];

    // The area that is being considered for improvement at this layer
    L.scope = getPos(state, state['L1'].selection, -1);

    // For each filter, consider the activations within the scope
    // const filters = state.filters[0];
    // // Acts at this layer are just the input...
    // const acts = state.input;
    // L.remainderInfo = getRemainderInfos(state, filters, acts, -1);
  }

  function L0(state) {
    console.log('run L0');
    updateCalculationsL0(state);
    const L = state['L0'];

    // Choose pos in filter to improve
    // const posToImprove = choose2D(L.remainderInfo[0].remainderTable);
    // const posToImproveVec = new Vec2(L.scope[0].x + posToImprove.x, L.scope[0].y + posToImprove.y);
    // L.selection = [posToImproveVec, posToImproveVec];
  }

  function isL0Done(state) {
    console.log('run isL0Done');
    updateCalculationsL0(state);

    // const filterName = 'L0';
    // const isDone = state[filterName].remainderInfo[0].remainder === 0;
    // console.log('is' + filterName + 'Done at pos=' + state[filterName].selection + ': ' + isDone, filterName + ', Remainder: ' + state[filterName].remainderInfo[0].remainder, filterName + ', RemainderTable: ' + state[filterName].remainderInfo[0].remainderTable);
    return true;
  }

  function move(state) {
    // Draw at selected point
    const pos = state.L1.selection[0];
    const scale = state.scales.canvas.scale;
    const p = state.sketches.stored;
    p.push();
    p.noStroke();
    p.fill(0);
    if (Math.random() > 0.7) {
      p.fill(255); // sometimes erase
    }
    p.rect(pos.x * scale, pos.y * scale, scale, scale);
    p.pop();
    console.log('Draw at: (' + pos.x + ', ' + pos.y + ')');
  }

  function format(imgArr, size) {
    const gray = [];
    for (let i = 0; i < imgArr.length; i += 4) {
      gray.push(1 - (imgArr[i] / 255));
    }
    const gray_f = nj.array(gray).reshape(size[0], size[1]);
    return gray_f.tolist();
  }

  // run classifier network
  function checkCanvas(state) {
    // write temp to stored
    // const temp = sketches.temp.get();
    // sketches.stored.image(temp, 0, 0);
    // sketches.temp.clear();

    // draw to appropriately size canvas
    const input = state.sketches.stored.get();
    input.resize(state.scales.canvas.size[0], state.scales.canvas.size[1]);
    state.sketches.input.image(input, 0, 0);
    state.sketches.input.loadPixels();
    const imgArr = format(state.sketches.input.pixels, state.scales.canvas.size);
    state.input = imgArr;

    const layerOutputs = sketch_a_net.evalLayers(imgArr, state.modelLayers);
    state.layerOutputs = layerOutputs;
  }

  async function getFilters(layers) {
    const allFilters = [];
    for (let i = 0; i < layers.length; i += 1) {
      const layerWeights = await layers[i].getWeights();
      const weightsTensor = await layerWeights[0].array();
      const filters = tensorToArray(weightsTensor);
      allFilters.push(filters);
    }

    return allFilters;
  }

  let pauseDraw = false;

  /**
  * The high level control flow for drawing a picture
  */
  async function drawPicture(state) {
    const speed = state.speed;

    // start - initialize
    let control = 'L3';
    state.picture = {};
    state.picture.isDone = false;

    let runs = 100;

    while (!state.picture.isDone) {
      if (!pauseDraw) {
        runs -= 1;
        if (runs === 0) {
          return;
        }
        switch (control) {
          case 'L3':
            L3(state);
            control = 'L2';
            break;
          case 'L2':
            L2(state);
            control = 'L1';
            break;
          case 'L1':
            L1(state);
            control = 'L0';
            break;
          case 'L0':
            L0(state);
            control = 'MOVE';
            break;
          case 'MOVE':
            move(state);

            // Add pause to animate drawing
            await pause(1000 / speed);

            // Update understanding of canvas
            checkCanvas(state);

            if (!isL0Done(state)) {
              control = 'MOVE';
              break;
            }
            if (!isL1Done(state)) {
              control = 'L0';
              break;
            }
            if (!isL2Done(state)) {
              control = 'L1';
              break;
            }
            if (!isL3Done(state)) {
              control = 'L2';
              break;
            }
            // done with ARTWORK
            state.picture.isDone = true;
            // p.image(blocked, 0, 0);
            console.log('Picture is done');
            break;
          default:
            console.log('Unknown state!');
            break;
        }

        animate.animate(state);
      } else {
        await pause(500);
      }
    }
  }

  function onChange(state) {
    const temp = state.sketches.temp.get();
    state.sketches.stored.image(temp, 0, 0);
    state.sketches.temp.clear();
  }

  async function setup(state) {
    state.scales = {
      canvas: {
        size: [16, 16],
        scale: 20,
      },
      layers: [
        {
          size: 16,
          scale: 5
        },
        {
          size: 16,
          scale: 5
        },
        {
          size: 16,
          scale: 5
        },
      ],
    };

    // Activation to seek for a given point in these layers to make a square
    state.maxActs = [3, 12, 46];
    state.layerGoals = [1, 1, 0];

    // Draw fixed images
    sketch_a_net.drawFilters();

    // Create sketches
    state.sketches = {
      stored: null, // permanent canvas at a big size
      input: null, // permanent canvas scaled to size for network
      temp: null, // buffer for human drawing on
      comp: null, // buffer for computer drawing on
      debug: null, // overlay to display items that will not become permanent
      layers: null // sketches for outputs of layers
    };
    await create_sketches.createSketches(state, () => {
      onChange(state);
    });

    // Load tf
    state.modelLayers = sketch_a_net.loadLayers(state);
    checkCanvas(state);
    state.filters = await getFilters(state.modelLayers);

    state.L3 = {};
    state.L2 = {};
    state.L1 = {};
    state.L0 = {};
    state.Move = {};
  }

  async function run() {
    const state = {
      speed: 5
    };
    await setup(state);

    for (let i = 0; i < 4; i += 1) {
      await drawPicture(state);
    }

    state.sketches.debug.clear();
    await pause(2000);

    document.location.reload();
  }

  document.addEventListener('keypress', e => {
    if (e.code === 'KeyA') {
      pauseDraw = !pauseDraw;
    }
  });

  run();
}());
