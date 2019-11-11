(function() {
  let networkAnimation;
  const containerNetworkAnimation = $('#network_animation');
  function sketch_networkAnimation(p) {
    networkAnimation = p;
    const w = $(containerNetworkAnimation).width();
    const h = $(containerNetworkAnimation).height();

    p.setup = function setup() {
      p.createCanvas(w, h);
      p.noLoop();
    };

    p.draw = function draw() {};
  }
  new p5(sketch_networkAnimation, $('#sketch_networkAnimation')[0]);

  function drawOutline(el, borderWidth) {
    const containerOffset = $(containerNetworkAnimation).offset();
    const elOffset = $(el).offset();
    const pad = borderWidth / 2;
    const w = $(el).outerWidth() + (2 * pad);
    const h = $(el).outerHeight() + (2 * pad);
    const x = elOffset.left - containerOffset.left - pad;
    const y = elOffset.top - containerOffset.top - pad;
    networkAnimation.stroke('orange');
    networkAnimation.strokeWeight(borderWidth);
    networkAnimation.noFill();
    networkAnimation.rect(x, y, w, h);
  }

  function filterToOutput(filters, outputs, color) {
    const containerOffset = $(containerNetworkAnimation).offset();
    for (let i = 0; i < filters.length; i += 1) {
      const output_i = Math.floor(i / (filters.length / outputs.length));

      // const connectionWidth = (1 - scores[i]) * 10;
      const connectionWidth = 3;
      console.log('connectionWidth', connectionWidth);
      const filterOffset = $(filters[i]).offset();
      const fw = $(filters[i]).outerWidth();
      const fh = $(filters[i]).outerHeight();
      const fx = filterOffset.left - containerOffset.left + (fw / 2);
      const fy = filterOffset.top - containerOffset.top + fh;
      const outputOffset = $(outputs[output_i]).offset();
      const ow = $(outputs[output_i]).outerWidth();
      const ox = outputOffset.left - containerOffset.left + (ow / 2);
      const oy = outputOffset.top - containerOffset.top;
      networkAnimation.stroke(color);
      networkAnimation.strokeWeight(connectionWidth);
      networkAnimation.line(fx, fy, ox, oy);
    }
  }

  function outputToFilter(outputs, filters, color) {
    const containerOffset = $(containerNetworkAnimation).offset();
    for (let i = 0; i < filters.length; i += 1) {
      const output_i = i % outputs.length;

      const connectionWidth = 3;
      const filterOffset = $(filters[i]).offset();
      const fw = $(filters[i]).outerWidth();
      const fx = filterOffset.left - containerOffset.left + (fw / 2);
      const fy = filterOffset.top - containerOffset.top;
      const outputOffset = $(outputs[output_i]).offset();
      const ow = $(outputs[output_i]).outerWidth();
      const oh = $(outputs[output_i]).outerHeight();
      const ox = outputOffset.left - containerOffset.left + (ow / 2);
      const oy = outputOffset.top - containerOffset.top + oh;
      networkAnimation.stroke(color);
      networkAnimation.strokeWeight(connectionWidth);
      networkAnimation.line(fx, fy, ox, oy);
    }
  }

  function highlightNeuron(p, total, scope, scoreTable, selection) {
    const scale = p.width / 16;
    p.push();

    // outline total area encompassed in this action
    p.stroke(p.color(255, 0, 0, 128));
    p.strokeWeight(1);
    p.noFill();

    const x_t = total[0].x * scale;
    const y_t = total[0].y * scale;
    const w_t = (total[1].x - total[0].x + 1) * scale;
    const h_t = (total[1].y - total[0].y + 1) * scale;
    p.rect(x_t, y_t, w_t, h_t);

    // highlight scope area with activation
    p.noStroke();

    const x_sc = scope[0].x;
    const y_sc = scope[0].y;
    const w_sc = scope[1].x - scope[0].x + 1;
    const h_sc = scope[1].y - scope[0].y + 1;

    for (let y = 0; y < h_sc; y += 1) {
      for (let x = 0; x < w_sc; x += 1) {
        p.fill(p.color(255, 0, 0, 128 * scoreTable[y][x]));
        p.rect((x_sc + x) * scale, (y_sc + y) * scale, scale, scale);
      }
    }

    // outline selection area with green
    p.stroke(p.color(0, 255, 0, 128));
    p.strokeWeight(1);
    p.noFill();

    const x_sel = selection[0].x * scale;
    const y_sel = selection[0].y * scale;
    const w_sel = (selection[1].x - selection[0].x + 1) * scale;
    const h_sel = (selection[1].y - selection[0].y + 1) * scale;
    p.rect(x_sel, y_sel, w_sel, h_sel);

    p.pop();
  }

  // function highlight(p, pos, colorType) {
  //   const scale = p.width / 16;
  //   p.push();
  //   p.noStroke();
  //   if (colorType === 0) {
  //     p.fill(p.color(255, 0, 0, 128));
  //   } else {
  //     p.fill(p.color(255, 0, 0, 64));
  //   }

  //   const startX = pos[0].x * scale;
  //   const startY = pos[0].y * scale;
  //   const w = (pos[1].x - pos[0].x + 1) * scale;
  //   const h = (pos[1].y - pos[0].y + 1) * scale;

  //   p.rect(startX, startY, w, h);
  //   p.pop();
  // }

  function animateNetwork(sketches, layerIndex, filterIndex, scores, idToImprove, totalPos, scopePos, scoreTable, selectionPos) {
    console.log('animate', layerIndex, scores, idToImprove);

    const rowContainerEl = $(containerNetworkAnimation).find('.connected_layers .layer_row').eq(layerIndex);
    const rowBelowContainerEl = $(containerNetworkAnimation).find('.connected_layers .layer_row').eq(layerIndex - 1);

    // draw a border around output relative to score for each neuron
    rowBelowContainerEl.find('.outputs canvas').each((i, el) => {
      const borderWidth = (1 - scores[i]) * 10;
      drawOutline(el, borderWidth);
    });

    // draw full connections
    const L_outputs = rowContainerEl.find('.outputs canvas');
    const L_filters = rowContainerEl.find('.filters canvas');
    const L_below_outputs = rowBelowContainerEl.find('.outputs canvas');

    filterToOutput(L_filters, L_outputs, 0);
    outputToFilter(L_below_outputs, L_filters, 0);

    // draw selected connections
    const L_outputs_sel = rowContainerEl.find('.outputs td').eq(filterIndex).find('canvas');
    const L_filters_sel = rowContainerEl.find('.filters td').eq(filterIndex).find('canvas').eq(idToImprove);
    const L_below_outputs_sel = rowBelowContainerEl.find('.outputs td').eq(idToImprove).find('canvas');

    filterToOutput(L_filters_sel, L_outputs_sel, 'red');
    outputToFilter(L_below_outputs_sel, L_filters_sel, 'red');

    // animate to output canvases
    console.log(sketches.layers[layerIndex - 1][idToImprove]);
    highlightNeuron(sketches.layers[2][0], totalPos, scopePos, scoreTable, selectionPos);

    // we could also animate with icon of filter traveling over to canvas and then placing it on the canvas to show how the plotter is somewhat following it...
  }

  function tensorToArray(tensor) {
    let arr = nj.array(tensor);
    arr = arr.transpose(3, 2, 0, 1);
    return arr.tolist()[0];
  }

  function getScore(acts, pos, maxAct, filter) {
    const [ startPos, endPos ] = pos;

    let total = 0;
    const distY = endPos.y - startPos.y;
    const distX = endPos.x - startPos.x;
    const scoreTable = [];
    for (let y = 0; y <= distY; y += 1) {
      const row = [];
      for (let x = 0; x <= distX; x += 1) {
        let filter_mod = 1;
        if (filter) {
          filter_mod = filter[y][x]
        }
        const acts_adj = acts[startPos.y + y][startPos.x + x] * filter_mod;
        total += acts_adj;
        row.push(filter_mod - acts_adj);
      }
      scoreTable.push(row);
    }
    console.log('Total: ' + total + ' out of ' + maxAct);
    const score = Math.min(1, total / maxAct);
    return { score, scoreTable };
  }

  function normalize(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      return arr.map(v => (1 / arr.length));
    }
    return arr.map(v => (v / sum));
  }

  function choose1D(arr) {
    const arr_i = arr.map(v => 1 - v);
    const arr_n = normalize(arr_i);
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
    const arr_i = arr_f.map(v => 1 - v);
    const arr_n = normalize(arr_i);
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

  const maxActs = [6, 18, 72];

  function draw(p, scale, filter_index, layer_pos) {
    p.stroke('red');
    p.strokeWeight(scale);
    p.noFill();
    if (filter_index === 0) {
      console.log('draw a vertical line', layer_pos[0].x * scale, layer_pos[0].y * scale, layer_pos[0].x * scale, (layer_pos[0].y + 3) * scale);
      p.line(layer_pos[0].x * scale, layer_pos[0].y * scale, layer_pos[0].x * scale, (layer_pos[0].y + 3) * scale);
    } else {
      console.log('draw a horizontal line', layer_pos[0].x * scale, layer_pos[0].y * scale, (layer_pos[0].x + 3) * scale, layer_pos[0].y * scale);
      p.line(layer_pos[0].x * scale, layer_pos[0].y * scale, (layer_pos[0].x + 3) * scale, layer_pos[0].y * scale);
    }
  }

  function highlightDraw(p, pos, scoreTable) {
    const scale = p.width / 16;
    p.push();
    p.noStroke();

    const startX = pos[0].x;
    const startY = pos[0].y;
    const w = pos[1].x - pos[0].x + 1;
    const h = pos[1].y - pos[0].y + 1;

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        p.fill(p.color(255, 0, 0, 128 * (1 - scoreTable[y][x])));
        p.rect((startX + x) * scale, (startY + y) * scale, scale, scale);
      }
    }

    p.rect(startX, startY, w, h);
    p.pop();
  }

  async function improve(sketches, scale, modelLayers, layerOutputs, layer_index, filter_index, totalPos, scopePos, selectionPos) {
    console.log('Improve L' + (layer_index + 1) + ', filter=' + filter_index + ', at pos=(' + layer_pos[0].x + ', ' + layer_pos[0].y + ')');

    const L = modelLayers[layer_index];
    const layerWeights = await L.getWeights();
    console.log('layerWeights', layerWeights);
    const weightsTensor = await layerWeights[0].array();
    console.log('weightsTensor', weightsTensor);
    const filters = tensorToArray(weightsTensor);
    console.log('filters', filters);

    // What are the filters from layer below contributing?
    const L_below = modelLayers[layer_index - 1];
    const posOffset = (L_below.kernelSize[0] - 1) / 2;
    const L_below_pos = [ new Vec2(layer_pos[0].x - posOffset, layer_pos[0].y - posOffset), new Vec2(layer_pos[1].x + posOffset, layer_pos[1].y + posOffset) ];
    const L_below_outputs = layerOutputs[layer_index - 1];
    const L_below_maxAct = maxActs[layer_index - 1];
    console.log('Calculating contributions from L' + layer_index + ' from pos=(' + L_below_pos[0].x + ', ' + L_below_pos[0].y + ') to pos=(' + L_below_pos[1].x + ', ' + L_below_pos[1].y + ')');
    const L_below_scores = [];
    const L_below_scoreTables = [];
    filters.forEach((filter, i) => {
      const acts = L_below_outputs[i];
      const { score, scoreTable } = getScore(acts, L_below_pos, L_below_maxAct, filter);
      L_below_scores.push(score);
      L_below_scoreTables.push(scoreTable);
      console.log('Score table contributions from L' + layer_index + ' for filter=' + i + ' with score=' + score + ':');
      console.log(JSON.stringify(scoreTable));
    });

    // Choose a filter with probability equal to normalized remaining potential
    const idxToImprove = choose1D(L_below_scores);

    // Choose pos in lower layer to improve
    const scoreTable = L_below_scoreTables[idxToImprove];

    let L_below_sub_pos;
    if (layer_index > 1) {
      const scoreTablePos = choose2D(scoreTable);
      const adjPos = new Vec2(L_below_pos[0].x + scoreTablePos.x, L_below_pos[0].y + scoreTablePos.y);
      L_below_sub_pos = [ adjPos, adjPos ];
      console.log('Chose to improve filter=' + idxToImprove + ' at pos=(' + adjPos.x + ', ' + adjPos.y + ')');
    }

    // totalPos, scopePos, scoreTable, selectionPos
    animateNetwork(sketches, layer_index, filter_index, L_below_scores, idxToImprove, L_below_pos, L_below_sub_pos);

    // reached bottom layer, end loop and draw
    if ((layer_index - 1) === 0) {
      console.log('Draw map', scoreTable);
      // draw(sketches.comp, scale, filter_index, L_below_pos);

      // highlight on debug...
      highlightDraw(sketches.debug, L_below_pos, scoreTable);

      return;
    }

    // continue animatiing layers
    setTimeout(() => {
      improve(sketches, scale, modelLayers, layerOutputs, layer_index - 1, idxToImprove, L_below_pos, L_below_sub_pos);
    }, 500);
  }

  function run(sketches, scale, modelLayers, layerOutputs) {
    networkAnimation.clear();
    const w = $(containerNetworkAnimation).outerWidth();
    const h = $(containerNetworkAnimation).outerHeight();
    if (w !== networkAnimation.width || h !== networkAnimation.height) {
      networkAnimation.resizeCanvas(w, h);
    }
    sketches.debug.clear();

    const pos = new Vec2(3, 3);
    const [ L1, L2, L3 ] = modelLayers;
    console.log('L2', L2);
    const [ L1_outputs, L2_outputs, L3_outputs ] = layerOutputs;

    // We want a square (also known as L3_0) at canvas:pos
    const L3_acts = L3_outputs[0];
    // Find part of L3_output, L3:pos, related to canvas:pos
    const L3_pos = [pos, pos];

    // Are we done yet? Is it high enough?
    const L3_maxAct = 200;
    const { score, scoreTable } = getScore(L3_acts, L3_pos, L3_maxAct);
    console.log('Current L3 score: ' + score, scoreTable);

    drawOutline($('#layer_L3 .outputs canvas')[0], (1 - score) * 10);
    highlightNeuron(sketches.layers[2][0], L3_pos, L3_pos, scoreTable, L3_pos);
    // if (score < 1) {
    //   // Not done yet
    //   improve(sketches, scale, modelLayers, layerOutputs, 2, 0, L3_pos);
    // }
  }

  function move() {

  }

  /**
  * The high level control flow for drawing a picture
  */
  async function drawPicture() {
    // start - initialize
    let control = 'L3';
    const state = {
      pen: null,
    };
    state.picture = {};
    state.picture.isDone = false;

    while (!state.picture.isDone) {
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
          control = 'MOVE';
          break;
        case 'MOVE':
          move(state);

          // Add pause to animate drawing
          await pause(1000 / speed);

          if (!isL3Done(state)) {
            control = 'L2';
            break;
          }
          if (!isL2Done(p, state)) {
            control = 'L1';
            break;
          }
          if (!isL1Done(state)) {
            control = 'DRAW';
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
    }
  }

  window.net_to_sketch = {
    drawPicture
  };
}());
