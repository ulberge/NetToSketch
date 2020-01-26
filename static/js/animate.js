(function() {
  // connect
  function filterToOutput(networkAnimation, filters, outputs, color) {
    const containerNetworkAnimation = $('#network_animation');
    const containerOffset = $(containerNetworkAnimation).offset();
    for (let i = 0; i < filters.length; i += 1) {
      const output_i = Math.floor(i / (filters.length / outputs.length));

      const connectionWidth = 3;
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

  function outputToFilter(networkAnimation, outputs, filters, color) {
    const containerNetworkAnimation = $('#network_animation');
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

  // function draw(p, scale, filter_index, layer_pos) {
  //   p.stroke('red');
  //   p.strokeWeight(scale);
  //   p.noFill();
  //   if (filter_index === 0) {
  //     console.log('draw a vertical line', layer_pos[0].x * scale, layer_pos[0].y * scale, layer_pos[0].x * scale, (layer_pos[0].y + 3) * scale);
  //     p.line(layer_pos[0].x * scale, layer_pos[0].y * scale, layer_pos[0].x * scale, (layer_pos[0].y + 3) * scale);
  //   } else {
  //     console.log('draw a horizontal line', layer_pos[0].x * scale, layer_pos[0].y * scale, (layer_pos[0].x + 3) * scale, layer_pos[0].y * scale);
  //     p.line(layer_pos[0].x * scale, layer_pos[0].y * scale, (layer_pos[0].x + 3) * scale, layer_pos[0].y * scale);
  //   }
  // }

  // function highlightDraw(p, pos, scoreTable) {
  //   const scale = p.width / 16;
  //   p.push();
  //   p.noStroke();

  //   const startX = pos[0].x;
  //   const startY = pos[0].y;
  //   const w = pos[1].x - pos[0].x + 1;
  //   const h = pos[1].y - pos[0].y + 1;

  //   for (let y = 0; y < h; y += 1) {
  //     for (let x = 0; x < w; x += 1) {
  //       p.fill(p.color(255, 0, 0, 128 * (1 - scoreTable[y][x])));
  //       p.rect((startX + x) * scale, (startY + y) * scale, scale, scale);
  //     }
  //   }

  //   p.rect(startX, startY, w, h);
  //   p.pop();
  // }


  function drawOutline(p, container, el, borderWidth, outlineColor) {
    const containerOffset = $(container).offset();
    const elOffset = el.offset();
    const pad = borderWidth / 2;
    const w = el.outerWidth() + (2 * pad);
    const h = el.outerHeight() + (2 * pad);
    const x = elOffset.left - containerOffset.left - pad;
    const y = elOffset.top - containerOffset.top - pad;
    p.stroke(outlineColor);
    p.strokeWeight(borderWidth);
    p.noFill();
    p.rect(x, y, w, h);
  }

  function normalize_array(arr) {
    normalize = function(v, max, min) {
      return (v - min) / (max - min);
    }

    const max = Math.max.apply(null, arr);
    const min = Math.min.apply(null, arr);

    if ((max - min) === 0) {
      return arr.map(v => v > 0 ? 1 : 0);
    }

    const norms = arr.map(v => normalize(v, max, min));
    return norms;
  }

  function drawActivations(state, p, scale, layerIndex, filterIndex) {
    // Draw activations to neuron
    const arr = state.layerOutputs[layerIndex][filterIndex];
    // normalize array in 255
    const h = arr.length;
    const w = arr[0].length;
    const arr_flat = arr.flat();
    const arr_flat_norm = normalize_array(arr_flat);

    let i = 0;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        p.fill(arr_flat_norm[i] * 255);
        p.rect(x * scale, y * scale, scale, scale);
        i += 1;
      }
    }
  }

  function annotateDrawing(state) {
    const L = state['L0'];

    if (L.scope === undefined) {
      return;
    }

    const { remainder, remainderTable } = state.L1.remainderInfo[state.L1.filterToImprove];
    // const { total, scope, selection } = L;
    const { total, scope } = L;
    const p = state.sketches.debug;
    const scale = state.scales.canvas.scale;
    p.clear();

    // Draw highlighting on neuron
    p.push();
    // outline total area encompassed in this action
    // p.stroke(p.color(255, 0, 0, 128));
    p.stroke(p.color(255, 0, 255, 128));
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
        p.fill(p.color(0, 255, 255, 64));
        p.rect((x_sc + x) * scale, (y_sc + y) * scale, scale, scale);
      }
    }
    let max = -Infinity;
    remainderTable.forEach(row => row.forEach(v => v > max ? max = v : v));
    if (max === 0) {
      max = 1;
    }
    for (let y = 0; y < h_sc; y += 1) {
      for (let x = 0; x < w_sc; x += 1) {
        const v = remainderTable[y][x] / max;
        if (v === 0) {
          // p.fill(p.color(255, 0, 255, 64));
          p.fill(p.color(0, 255, 255, 64));
        } else {
          p.fill(p.color(255 * remainderTable[y][x] / max, 0, 0, 255));
        }
        p.rect((x_sc + x) * scale, (y_sc + y) * scale, scale, scale);
      }
    }

    // outline selection area with green
    // p.stroke(p.color(0, 255, 0, 128));
    // p.strokeWeight(1);
    // p.noFill();
    // const x_sel = selection[0].x * scale;
    // const y_sel = selection[0].y * scale;
    // const w_sel = (selection[1].x - selection[0].x + 1) * scale;
    // const h_sel = (selection[1].y - selection[0].y + 1) * scale;
    // p.rect(x_sel, y_sel, w_sel, h_sel);
    // p.pop();
  }

  function annotateNeuron(state, layerIndex, filterIndex) {
    const layerName = layerIndex + 1;
    const L = state['L' + layerName];

    if (L.filterToImprove === undefined) {
      return;
    }

    const { remainder_abs, possible, remainderTable } = L.remainderInfo[filterIndex];
    const { total, scope, selection } = L;
    const p = state.sketches.layers[layerIndex][filterIndex];
    const scale = p.width / state.scales.layers[layerIndex].size;
    const containerNetworkAnimation = $('#network_animation');
    const neuronEl = containerNetworkAnimation.find('#layer_L' + layerName + ' .outputs canvas').eq(filterIndex);
    p.clear();
    p.background(255);
    const selectionColor = p.color(255, 100, 0, 128);

    // console.log('L' + layerName, L);

    drawActivations(state, p, scale, layerIndex, filterIndex);

    // Draw outline on neuron
    const outlineWidth = (remainder_abs / possible) * 10;
    let outlineColor = state.sketches.animation.color(0, 0, 0, 128);
    if (filterIndex === L.filterToImprove) {
      outlineColor = selectionColor;
    }
    drawOutline(state.sketches.animation, containerNetworkAnimation, neuronEl, outlineWidth, outlineColor);


    if (filterIndex === L.filterToImprove) {
      // Draw highlighting on neuron
      p.push();
      // outline total area encompassed in this action
      // p.stroke(p.color(255, 0, 0, 128));
      p.stroke(p.color(255, 0, 255, 128));
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
      let max = -Infinity;
      remainderTable.forEach(row => row.forEach(v => v > max ? max = v : v));
      for (let y = 0; y < h_sc; y += 1) {
        for (let x = 0; x < w_sc; x += 1) {
          const v = remainderTable[y][x] / max;
          if (v === 0) {
            // p.fill(p.color(255, 0, 255, 64));
            p.fill(p.color(0, 255, 255, 128));
          } else {
            p.fill(p.color(255, 0, 0, 64 + (64 * remainderTable[y][x] / max)));
          }
          p.rect((x_sc + x) * scale, (y_sc + y) * scale, scale, scale);
        }
      }
    }

    if (filterIndex === L.filterToImprove) {
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

    if (state['L' + layerIndex].remainderInfo) {
      const filterContainer = containerNetworkAnimation.find('#layer_L' + (layerIndex + 1) + ' .filters');
      const selectedFilterContainer = filterContainer.find('td').eq(L.filterToImprove);
      let remainderContainer = selectedFilterContainer.find('.remainders');
      if (remainderContainer.length === 0) {
        selectedFilterContainer.append('<div class="remainders"></div>');
        remainderContainer = selectedFilterContainer.find('.remainders');
      }
      filterContainer.find('.remainders').empty();
      state['L' + layerIndex].remainderInfo.forEach(info => {
        remainderContainer.append('<span class="remainderText">' + info.remainder_abs + '</span>');
        // remainderContainer.append('<span class="remainderText">(' + info.remainder_abs + ', ' + info.remainder + ')</span>');
      });
    }
  }

  function animate(state) {
    state.sketches.animation.clear();
    const containerNetworkAnimation = $('#network_animation');
    const w = containerNetworkAnimation.outerWidth();
    const h = containerNetworkAnimation.outerHeight();
    if (w !== state.sketches.animation.width || h !== state.sketches.animation.height) {
      state.sketches.animation.resizeCanvas(w, h);
    }

    // annotate neurons
    annotateNeuron(state, 2, 0);
    annotateNeuron(state, 1, 0);
    annotateNeuron(state, 1, 1);
    annotateNeuron(state, 1, 2);
    annotateNeuron(state, 1, 3);
    annotateNeuron(state, 0, 0);
    annotateNeuron(state, 0, 1);

    // draw connections
    const selectionColor = state.sketches.animation.color(255, 100, 0, 128);
    for (let i = 0; i < 3; i += 1) {
      const rowContainerEl = containerNetworkAnimation.find('.connected_layers .layer_row').eq(i);
      let rowBelowContainerEl;
      if (i > 0) {
        rowBelowContainerEl = containerNetworkAnimation.find('.connected_layers .layer_row').eq(i - 1);
      } else {
        rowBelowContainerEl = containerNetworkAnimation.find('#layer_L0.layer_row');
      }
      const networkAnimation = state.sketches.animation;
      // draw full connections
      const L_outputs = rowContainerEl.find('.outputs canvas');
      const L_filters = rowContainerEl.find('.filters canvas');
      const L_below_outputs = rowBelowContainerEl.find('.outputs canvas');

      filterToOutput(networkAnimation, L_filters, L_outputs, networkAnimation.color(0, 0, 0, 128));
      outputToFilter(networkAnimation, L_below_outputs, L_filters, networkAnimation.color(0, 0, 0, 128));

      // draw selected connections
      const filterIndex = state['L' + i].filterToImprove;
      const filterIndexAbove = state['L' + (i + 1)].filterToImprove;
      const L_outputs_sel = rowContainerEl.find('.outputs td').eq(filterIndexAbove).find('canvas');
      const L_filters_sel = rowContainerEl.find('.filters td').eq(filterIndexAbove).find('canvas').eq(filterIndex);
      const L_below_outputs_sel = rowBelowContainerEl.find('.outputs td').eq(filterIndex).find('canvas');

      filterToOutput(networkAnimation, L_filters_sel, L_outputs_sel, selectionColor);
      outputToFilter(networkAnimation, L_below_outputs_sel, L_filters_sel, selectionColor);
    }

    // annotate input
    annotateDrawing(state);

    console.log(state);
  }

  window.animate = {
    animate
  };
}());
