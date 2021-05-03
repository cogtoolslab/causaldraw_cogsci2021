import os, sys

import pymongo as pm
import numpy as np
import scipy.stats as stats
import pandas as pd
import json
import re
from io import BytesIO
from PIL import Image
from skimage import io, img_as_float
import base64

import matplotlib
from matplotlib import pylab, mlab, pyplot
from IPython.core.pylabtools import figsize, getfigs
plt = pyplot
import seaborn as sns
sns.set_context('talk')
sns.set_style('white')

from IPython.display import clear_output
import importlib

import warnings

def render_images(D, 
                 data = 'paintCanvasPng',
                 metadata = ['condition','category'],
                 out_dir = './sketches',
                 delimiter = '_',
                 overwrite = True,
                 clear = True):
    '''
    input: dataframe D containing png data (see data keyword argument)
           and list of metadata attributes (see metadata keyword argument)
           out_dir = which directory to save the pngs to
           delimiter = when constructing each filename, what character to stick in between each attribute
    output: return list of PIL Images;
            saves images out as PNG files to out_path 
            where each filename is constructed from concatenating metadata attributes
    '''
    for i,d in D.iterrows():         
        # convert pngData string into a PIL Image object
        im = Image.open(BytesIO(base64.b64decode(d['pngData'])))

        # construct the filename by concatenating attributes
        attributes = [str(d[attr]) for  attr in metadata]
        fname = delimiter.join(attributes)        
        
        # create the out_dir if it does not already exist
        if not os.path.exists(out_dir): 
            os.makedirs(out_dir)
            
        # now save the image out to that directory
        if (overwrite or not os.path.exists(os.path.join(out_dir,fname+'.png'))):
            print('Currently rendering {} | {} of {}'.format(d['category'],i+1,D.shape[0])) 
            im.save(os.path.join(out_dir,fname+'.png'),'PNG')
        else:
            print('Skipping {} | {} of {}'.format(d['category'],i+1,D.shape[0])) 
        if clear:
            clear_output(wait=True) 
    
    print('Done rendering {} images to {}.'.format(D.shape[0],out_dir))