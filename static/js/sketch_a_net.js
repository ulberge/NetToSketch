(function() {

  let weights1 = [
    [  // Filter vertical
      [  // Ch 0
          [-1, 2, -1],
          [-1, 2, -1],
          [-1, 2, -1],
      ]
    ],
    [  // Filter horizontal
      [  // Ch 0
          [-1, -1, -1],
          [2, 2, 2],
          [-1, -1, -1],
      ]
    ],
  ];
  // const biases1 = Array(2).fill(-2);
  const biases1 = Array(2).fill(0);

  // L2 - corners
  // const diags = [
  //     [
  //         [0, 1, 0],
  //         [1, 0, 0],
  //         [0, 0, 0]
  //     ],
  //     [
  //         [0, 0, 0],
  //         [0, 0, 1],
  //         [0, 1, 0]
  //     ],
  //     [
  //         [0, 1, 0],
  //         [0, 0, 1],
  //         [0, 0, 0]
  //     ],
  //     [
  //         [0, 0, 0],
  //         [1, 0, 0],
  //         [0, 1, 0]
  //     ],
  // ];
  // const diags = [
  //     [
  //         [1, 1, 0.5],
  //         [1, 0.5, 0],
  //         [0.5, 0, 0]
  //     ],
  //     [
  //         [0, 0, 0.5],
  //         [0, 0.5, 1],
  //         [0.5, 1, 1]
  //     ],
  //     [
  //         [0.5, 1, 1],
  //         [0, 0.5, 1],
  //         [0, 0, 0.5]
  //     ],
  //     [
  //         [0.5, 0, 0],
  //         [1, 0.5, 0],
  //         [1, 1, 0.5]
  //     ],
  // ];
  // let weights2 = [
  //     [  // top left
  //         diags[3],
  //         diags[2]
  //     ],
  //     [  // top right
  //         diags[1],
  //         diags[0]
  //     ],
  //     [  // bottom left
  //         diags[0],
  //         diags[1]
  //     ],
  //     [  // bottom right
  //         diags[2],
  //         diags[3]
  //     ],
  // ];
  let weights2 = [
      [  // top left
        [
            [-1, -1, -1],
            [-1, 1, -1],
            [-1, 1, -1]
        ],
        [
            [-1, -1, -1],
            [-1, 1, 1],
            [-1, -1, -1]
        ],
      ],
      [  // top right
        [
            [-1, -1, -1],
            [-1, 1, -1],
            [-1, 1, -1]
        ],
        [
            [-1, -1, -1],
            [1, 1, -1],
            [-1, -1, -1]
        ],
      ],
      [  // bottom left
        [
            [-1, 1, -1],
            [-1, 1, -1],
            [-1, -1, -1]
        ],
        [
            [-1, -1, -1],
            [-1, 1, 1],
            [-1, -1, -1]
        ],
      ],
      [  // bottom right
        [
            [-1, 1, -1],
            [-1, 1, -1],
            [-1, -1, -1]
        ],
        [
            [-1, -1, -1],
            [1, 1, -1],
            [-1, -1, -1]
        ],
      ],
  ];
  // let weights2 = [
  //     [  // top left
  //       [
  //           [-1, -1, -1],
  //           [-1, 1, -1],
  //           [-1, 1, -1]
  //       ],
  //       [
  //           [1, 1, 1],
  //           [-1, -1, -1],
  //           [0, 0, 0]
  //       ],
  //     ],
  //     [  // top right
  //       [
  //           [0, -1, 1],
  //           [0, -1, 1],
  //           [0, -1, 1]
  //       ],
  //       [
  //           [1, 1, 1],
  //           [-1, -1, -1],
  //           [0, 0, 0]
  //       ],
  //     ],
  //     [  // bottom left
  //       [
  //           [1, -1, 0],
  //           [1, -1, 0],
  //           [1, -1, 0]
  //       ],
  //       [
  //           [0, 0, 0],
  //           [-1, -1, -1],
  //           [1, 1, 1]
  //       ],
  //     ],
  //     [  // bottom right
  //       [
  //           [0, -1, 1],
  //           [0, -1, 1],
  //           [0, -1, 1]
  //       ],
  //       [
  //           [0, 0, 0],
  //           [-1, -1, -1],
  //           [1, 1, 1]
  //       ],
  //     ],
  // ];
  // const biases2 = Array(4).fill(-5);
  const biases2 = Array(4).fill(0);

  // L3 - square
  const weights3 = [
      [
          [
              [1, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
          ],
          [
              [0, 0, 1],
              [0, 0, 0],
              [0, 0, 0],
          ],
          [
              [0, 0, 0],
              [0, 0, 0],
              [1, 0, 0],
          ],
          [
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 1],
          ]
      ],
  ];
  // const biases3 = Array(1).fill(-3);
  const biases3 = Array(1).fill(0);

  // const weights = [ weights1, weights2, weights3 ].map(a => nj.array(a).transpose(2, 3, 1, 0).tolist());
  // const weights = [ weights1, weights2, weights3 ];
  const weights = [ weights1, weights2, weights3 ];
  const biases = [ biases1, biases2, biases3 ];

  const weightTs = [];
  for (let i = 0; i < 3; i += 1) {
    let w = weights[i];
    const b = biases[i];
    w = nj.array(w).transpose(2, 3, 1, 0).tolist();
    weightTs.push([tf.tensor4d(w), tf.tensor1d(b)]);
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

  function getFilterSketch(arr, layer_i) {
    const filterSizes = [3, 3, 3];
    const scale = 10;

    return (p) => {
      const sketchSize = filterSizes[layer_i];

      p.setup = function setup() {
        p.pixelDensity(1);
        p.createCanvas(sketchSize * scale, sketchSize * scale);
        p.background(255);
        p.noLoop();
        p.noStroke();
      };

      p.draw = function draw() {
        // normalize array in 255
        const arr_flat = arr.flat();
        const arr_flat_norm = normalize_array(arr_flat);

        let i = 0;
        for (let y = 0; y < sketchSize; y += 1) {
          for (let x = 0; x < sketchSize; x += 1) {
            p.fill(arr_flat_norm[i] * 255);
            p.rect(x * scale, y * scale, scale, scale);
            i += 1;
          }
        }
      }
    };
  }

  function drawFilters() {
    $('#layer_L1 .filters').append('<td><div class="filter0"></div></td>');
    new p5(getFilterSketch(weights1[0][0], 0), $('#layer_L1 .filter0')[0]);
    $('#layer_L1 .filters').append('<td><div class="filter1"></div></td>');
    new p5(getFilterSketch(weights1[1][0], 0), $('#layer_L1 .filter1')[0]);

    $('#layer_L2 .filters').append('<td><div class="filter0"></div></td>');
    new p5(getFilterSketch(weights2[0][0], 1), $('#layer_L2 .filter0')[0]);
    new p5(getFilterSketch(weights2[0][1], 1), $('#layer_L2 .filter0')[0]);

    $('#layer_L2 .filters').append('<td><div class="filter1"></div></td>');
    new p5(getFilterSketch(weights2[1][0], 1), $('#layer_L2 .filter1')[0]);
    new p5(getFilterSketch(weights2[1][1], 1), $('#layer_L2 .filter1')[0]);

    $('#layer_L2 .filters').append('<td><div class="filter2"></div></td>');
    new p5(getFilterSketch(weights2[2][0], 1), $('#layer_L2 .filter2')[0]);
    new p5(getFilterSketch(weights2[2][1], 1), $('#layer_L2 .filter2')[0]);

    $('#layer_L2 .filters').append('<td><div class="filter3"></div></td>');
    new p5(getFilterSketch(weights2[3][0], 1), $('#layer_L2 .filter3')[0]);
    new p5(getFilterSketch(weights2[3][1], 1), $('#layer_L2 .filter3')[0]);

    $('#layer_L3 .filters').append('<td><div class="filter0"></div></td>');
    new p5(getFilterSketch(weights3[0][0], 2), $('#layer_L3 .filter0')[0]);
    new p5(getFilterSketch(weights3[0][1], 2), $('#layer_L3 .filter0')[0]);
    new p5(getFilterSketch(weights3[0][2], 2), $('#layer_L3 .filter0')[0]);
    new p5(getFilterSketch(weights3[0][3], 2), $('#layer_L3 .filter0')[0]);
  }

  function loadLayers(state) {
    const modelLayers = [];

    modelLayers.push(tf.layers.conv2d({
      filters: 2,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      weights: weightTs[0],
      activation: 'relu',
      name: 'conv1'
    }));

    modelLayers.push(tf.layers.conv2d({
      filters: 4,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      weights: weightTs[1],
      activation: 'relu',
      name: 'conv2'
    }));

    modelLayers.push(tf.layers.conv2d({
      filters: 1,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      weights: weightTs[2],
      activation: 'relu',
      name: 'conv3'
    }));

    return modelLayers;
  }

  function evalLayers(imgArr, modelLayers) {
    let imgArr_f = nj.array([imgArr]);
    imgArr_f = imgArr_f.reshape([1, 16, 16, 1]);
    imgArr_f = imgArr_f.tolist();

    let curr = tf.tensor4d(imgArr_f);
    let layerOutputs = [];
    modelLayers.forEach((layer, i) => {
      // console.log('L' + (i + 1) + ' input', curr.shape);
      const result = layer.apply(curr);
      layerOutputs.push(result.arraySync());
      curr = result;
    });
    // console.log('output', curr.shape);

    // format into neurons
    layerOutputs = layerOutputs.map(o => {
      o = nj.array(o[0]);
      o = o.transpose(2, 0, 1);
      return o.tolist();
    });

    return layerOutputs;
  }

  window.sketch_a_net = {
    drawFilters,
    loadLayers,
    evalLayers,
  };
}());
