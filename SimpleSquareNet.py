import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras import datasets, layers, models, initializers
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw
import random
import math

from SimpleSquareNetWeights import weights, biases


def load_layers():
    model_layers = []

    # L1 - lines
    model_layers.append(layers.Conv2D(
        2,
        (3, 3),
        strides=1,
        padding='same',
        kernel_initializer=initializers.Constant(weights[0]),
        bias_initializer=initializers.Constant(biases[0]),
        activation='relu',
        input_shape=(None, None, 1),
        name='conv1'
    ))

    # L2 - corners
    model_layers.append(layers.Conv2D(
        4,
        (3, 3),
        strides=1,
        padding='same',
        kernel_initializer=initializers.Constant(weights[1]),
        bias_initializer=initializers.Constant(biases[1]),
        activation='relu',
        name='conv2'
    ))

    # L3 - shapes
    model_layers.append(layers.Conv2D(
        1,
        (3, 3),
        strides=1,
        padding='same',
        kernel_initializer=initializers.Constant(weights[2]),
        bias_initializer=initializers.Constant(biases[2]),
        activation='relu',
        name='conv3'
    ))

    return model_layers


def save_imgs(imgs, name, ids=None):
    if not plt.get_fignums():
        plt.figure()

    row_size = len(imgs) / 2
    for i, img in enumerate(imgs):
        print(img.shape)
        plt.subplot(2, int(row_size), i + 1)
        plt.imshow(img.squeeze(), cmap='gray')
        if ids is not None:
            plt.ylabel(str(ids[i]))
        plt.axis('off')

    plt.savefig(name + '.png')
    plt.clf()

def save_imgs(imgs, name, ids=None):
    if not plt.get_fignums():
        plt.figure()

    row_size = math.ceil(len(imgs) / 2)
    for i, img in enumerate(imgs):
        plt.subplot(math.ceil(len(imgs) / row_size), int(row_size), i + 1)
        plt.imshow(img.squeeze(), cmap='gray')
        if ids is not None:
            plt.ylabel(str(ids[i]))
        plt.axis('off')

    plt.savefig(name + '.png')
    plt.clf()


def save_img(img, name):
    if not plt.get_fignums():
        plt.figure()
    plt.imshow(img.squeeze(), cmap='gray')
    plt.axis('off')
    plt.savefig(name + '.png')
    plt.clf()


def eval_layers(img, model_layers):
    # save img and set of imgs for each layer
    np.set_printoptions(threshold=np.inf)

    curr = np.array([img, ])
    for layer_index, layer in enumerate(model_layers):
        print('Before L' + str(layer_index + 1), curr.shape)
        curr = layer(curr)

        # collect filter weight imgs
        weights = layer.get_weights()
        print('Weights L' + str(layer_index + 1), weights[0].shape)
        filter_weight_imgs = []
        filters = np.einsum('hwcf->fchw', weights[0])
        for channels in filters:
            for channel in channels:
                filter_weight_imgs.append(channel)

        # collect filter output imgs
        output_imgs = []
        output = np.einsum('chwf->fhwc', curr)
        for channel in output:
            output_imgs.append(channel)

        all_images = filter_weight_imgs
        all_images.extend(output_imgs)
        save_imgs(all_images, 'L' + str(layer_index + 1) + '_outputs')

    return curr


def getTestDrawing():
    size = 16
    img = Image.new('RGB', (size, size), (0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.line((4, 4, 4, 6), fill=(255, 255, 255), width=1)
    draw.line((4, 6, 6, 6), fill=(255, 255, 255), width=1)
    draw.line((6, 6, 6, 4), fill=(255, 255, 255), width=1)
    draw.line((6, 4, 4, 4), fill=(255, 255, 255), width=1)

    img = np.delete(img, [1, 2], axis=2)
    img = img / 255
    img = np.asarray(img).astype(np.float32)
    return img


def test():
    print('test')
    img = getTestDrawing()
    save_img(img, 'orig')
    model_layers = load_layers()
    result = eval_layers(img, model_layers)
    print(result)


if __name__ == '__main__':
    test()
