import numpy as np

# L1 - lines
weights1 = np.array([
    [  # Filter vertical
        [  # Ch 0
            [-1, 2, -1],
            [-1, 2, -1],
            [-1, 2, -1],
        ]
    ],
    [  # Filter horizontal
        [  # Ch 0
            [-1, -1, -1],
            [2, 2, 2],
            [-1, -1, -1],
        ]
    ],
])
weights1 = np.einsum('fchw->hwcf', weights1)
biases1 = np.array([
    0, 0,
])

# L2 - corners
diags = [
    [
        [1, 1, 0.5],
        [1, 0.5, 0],
        [0.5, 0, 0]
    ],
    [
        [0, 0, 0.5],
        [0, 0.5, 1],
        [0.5, 1, 1]
    ],
    [
        [0.5, 1, 1],
        [0, 0.5, 1],
        [0, 0, 0.5]
    ],
    [
        [0.5, 0, 0],
        [1, 0.5, 0],
        [1, 1, 0.5]
    ],
]
weights2 = np.array([
    [  # top left
        diags[3],
        diags[2]
    ],
    [  # top right
        diags[1],
        diags[0]
    ],
    [  # bottom left
        diags[0],
        diags[1]
    ],
    [  # bottom right
        diags[2],
        diags[3]
    ],
])
weights2 = np.einsum('fchw->hwcf', weights2)
biases2 = np.array([
    0, 0, 0, 0
])

# L3 - square
weights3 = np.array([
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
])
weights3 = np.einsum('fchw->hwcf', weights3)
biases3 = np.array([
    0
])

weights = [weights1, weights2, weights3]
biases = [biases1, biases2, biases3]
