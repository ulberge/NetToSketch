import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras import datasets, layers, models, initializers
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw
import random
import math

from SquareNetWeights import weights, biases

def load_model():
    # L1 - lines
    layer1conv = layers.Conv2D(
        2,
        (5, 5),
        strides=1,
        padding='valid',
        kernel_initializer=initializers.Constant(weights[0]),
        bias_initializer=initializers.Constant(biases[0]),
        activation='relu',
        input_shape=(16, 16, 1),
        name='conv1'
    )
    layer1pool = layers.MaxPooling2D(
        pool_size=(3, 3),
        strides=2,
        padding='same',
        name='Pool1'
    )

    # L2 - connections
    # layer2conv = layers.Conv2D(
    #     2,
    #     (3, 3),
    #     strides=1,
    #     padding='same',
    #     kernel_initializer=initializers.Constant(weights2),
    #     bias_initializer=initializers.Constant(biases2),
    #     activation='relu',
    #     name='conv2'
    # )
    # layer2pool = layers.MaxPooling2D(
    #     pool_size=(2, 2),
    #     strides=2,
    #     padding='same',
    #     name='Pool2'
    # )

    model_layers = [layer1conv, layer1pool]
    return model_layers


def load_image(file_name):
    img = np.float32(cv2.imread(file_name))
    # Remove two channels
    img = np.delete(img, [1, 2], axis=2)
    img = img / 255
    return img


def eval_layers(img, model_layers):
    # print(img.shape)
    dna = []
    np.set_printoptions(threshold=np.inf)

    plt.figure()

    row_size = 8
    rows = 10

    plt.subplot(rows, row_size, 1)
    plt.imshow(img.squeeze(), cmap='gray')
    plt.axis('off')

    curr = np.array([img, ])
    line = 1
    for layer_index, layer in enumerate(model_layers):
        dna_layer = []
        curr = layer(curr)
        curr = np.where(curr <= 0, np.float32(0.0), np.float32(1.0))

        channels, h, w, count = curr.shape
        weights = layer.get_weights()
        if len(weights) > 0:
            weights = np.array(weights[0])
            filters = np.einsum('hwcf->fchw', weights)
            w_count = 0
            for i, channels in enumerate(filters):
                for j, weight_img in enumerate(channels):
                    plt.subplot(rows, row_size, (line * row_size) + w_count + 1)
                    plt.imshow(weight_img.squeeze(), cmap='gray')
                    plt.axis('off')

                    w_count += 1
            line += 1

        for i in range(count):
            sub_solution = curr[0, :, :, i]
            # print(sub_solution)
            val = np.sum(sub_solution) / (h * w)
            dna_layer.append(val)

            plt.subplot(rows, row_size, (line * row_size) + i + 1)
            plt.imshow(sub_solution, cmap='gray')
            plt.axis('off')

        line += 1

        if 'conv' in layer.name:
            dna.append(dna_layer)

    plt.show()

    dna = np.array(dna).flatten()

    return dna


def getLineDrawing():
    size = 64
    line_size = 20
    h_line_size = line_size / 2
    im = Image.new('RGB', (size, size), (0, 0, 0))
    draw = ImageDraw.Draw(im)

    line_count = random.randint(3, 10)
    vert_count = line_count - random.randint(0, line_count)
    for i in range(vert_count):
        x = random.randint(0, size - line_size)
        y = random.randint(0, size - line_size)
        h = line_size
        draw.line((x, y, x, y + h), fill=(255, 255, 255), width=1)

    horiz_count = line_count - vert_count
    for i in range(horiz_count):
        x = random.randint(0, size - line_size)
        y = random.randint(0, size - line_size)
        w = line_size
        draw.line((x, y, x + w, y), fill=(255, 255, 255), width=1)

    return im


def dotproduct(v1, v2):
    return sum((a*b) for a, b in zip(v1, v2))


def length(v):
    return math.sqrt(dotproduct(v, v))


def angle(v1, v2):
    # print(dotproduct(v1, v2), length(v1), length(v2), v1, v2)
    return math.acos(max(-1, min(1, dotproduct(v1, v2) / (length(v1) * length(v2)))))


def generateImgs(img_count=64):
    # randomly generate 64x64 images with vertical and horizontal lines
    imgs = []
    dnas = []

    # plt.figure()

    for i in range(img_count):
        img = np.float32(np.asarray(getLineDrawing()))
        img_prep = np.delete(img, [1, 2], axis=2)
        img_prep = img_prep / 255
        imgs.append(img_prep)

        # plt.subplot(4, 4, i + 1)
        # plt.imshow(img_prep.squeeze(), cmap='gray')
        # plt.axis('off')

        dna = eval_layers(img_prep, model_layers)
        dnas.append(dna)
    # plt.show()

    # print(dnas)
    return imgs, dnas


def drawLineImage(s):
    size = 64
    img = Image.new('RGB', (size, size), (0, 0, 0))
    draw = ImageDraw.Draw(img)

    if '0' in s:
        # vertical
        draw.line((1, 1, 1, 3), fill=(255, 255, 255), width=1)
    if '1' in s:
        # horizontal
        draw.line((1, 1, 3, 1), fill=(255, 255, 255), width=1)
    if '2' in s:
        # diagonal 1
        draw.line((1, 1, 3, 3), fill=(255, 255, 255), width=1)
    if '3' in s:
        # diagonal 2
        draw.line((3, 1, 1, 3), fill=(255, 255, 255), width=1)

    # end points
    # vertical
    if '4' in s:
        draw.line((1, 1, 1, 2), fill=(255, 255, 255), width=1)
    if '5' in s:
        draw.line((1, 2, 1, 3), fill=(255, 255, 255), width=1)

    # horizontal
    if '6' in s:
        draw.line((1, 1, 2, 1), fill=(255, 255, 255), width=1)
    if '7' in s:
        draw.line((2, 1, 3, 1), fill=(255, 255, 255), width=1)
    # diagonal 1
    if '8' in s:
        draw.line((1, 1, 2, 2), fill=(255, 255, 255), width=1)
    if '9' in s:
        draw.line((2, 2, 1, 1), fill=(255, 255, 255), width=1)
    # diagonal 2
    if 'a' in s:
        draw.line((3, 1, 1, 2), fill=(255, 255, 255), width=1)
    if 'b' in s:
        draw.line((2, 1, 1, 3), fill=(255, 255, 255), width=1)

    return img


def checkLayer1():
    # draw every type of view it could encounter at center and check that it only fires for the correct ones
    s_list = []
    lines = ['0', '1', '2', '3']
    ends = [['4', '5'], ['6', '7'], ['8', '9'], ['a', 'b']]

    for line in lines:
        for line2 in lines:
            if line != line2:
                img_s


    line_count = random.randint(3, 10)
    vert_count = line_count - random.randint(0, line_count)
    for i in range(vert_count):
        x = random.randint(0, size - line_size)
        y = random.randint(0, size - line_size)
        h = line_size
        draw.line((x, y, x, y + h), fill=(255, 255, 255), width=1)

    horiz_count = line_count - vert_count
    for i in range(horiz_count):
        x = random.randint(0, size - line_size)
        y = random.randint(0, size - line_size)
        w = line_size
        draw.line((x, y, x + w, y), fill=(255, 255, 255), width=1)

    return im
