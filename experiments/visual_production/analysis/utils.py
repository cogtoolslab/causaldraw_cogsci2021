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
                 data = 'pngData',
                 metadata = ['gameID','toy_type','toy_variant','condition'],
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
        attributes = [d[attr] for  attr in metadata]
        fname = delimiter.join(attributes)        
        
        # create the out_dir if it does not already exist
        if not os.path.exists(out_dir): 
            os.makedirs(out_dir)
            
        # now save the image out to that directory
        if (overwrite or not os.path.exists(os.path.join(out_dir,fname+'.png'))):
            print('Currently rendering {} | {} of {}'.format(d['toy_type'],i+1,D.shape[0])) 
            im.save(os.path.join(out_dir,fname+'.png'),'PNG')
        else:
            print('Skipping {} | {} of {}'.format(d['toy_type'],i+1,D.shape[0])) 
        if clear:
            clear_output(wait=True) 
    
    print('Done rendering {} images to {}.'.format(D.shape[0],out_dir))

    
def render_sketch_gallery(gameids, 
                          sketch_dir = './sketches',
                          gallery_dir = './gallery',
                          num_trials = 6):
    '''
    input: 
         gameids: list of gameids
         sketch_dir: full path to dir containing rendered PNG sketch files (data source)
         gallery_dir: full path to dir where you want to save gallery image out (data destination)
         num_trials: how many trials per game? used to determine subplot arrangement
    '''
    sketch_paths = sorted([sketch_path for sketch_path in os.listdir(sketch_dir)])

    ## make guess about how many rows and columns to use
    nrows = 3
    ncols = num_trials / nrows if num_trials%nrows==0 else int(np.ceil(num_trials/nrows))
    
    # create the gallery_dir if it does not already exist
    if not os.path.exists(gallery_dir): 
        os.makedirs(gallery_dir)                
    
    for gind, game in enumerate(gameids): 
        print('Generating sketch gallery for participant: {} | {} of {}'.format(game,gind+1,len(gameids)))
        clear_output(wait=True)
        # get list of all sketch paths JUST from current game
        game_sketch_paths = [path for path in sketch_paths if path.split('_')[0] == game]
        fig = plt.figure(figsize=(8,12))   
        for i,f in enumerate(game_sketch_paths):
            # open image
            im = Image.open(os.path.join(sketch_dir,f))
            # get metadata
            gameid = f.split('_')[0] 
            toy_type = f.split('_')[1]
            toy_variant = f.split('_')[2]
            condition = f.split('_')[3].split('.')[0]   
            # make gallery
            p = plt.subplot(nrows,ncols,i+1)
            plt.imshow(im)
            sns.set_style('white')
            k = p.get_xaxis().set_ticklabels([])
            k = p.get_yaxis().set_ticklabels([])
            k = p.get_xaxis().set_ticks([])
            k = p.get_yaxis().set_ticks([])   
            p.axis('off')
            plt.title('{} {} {}'.format(toy_type,toy_variant,condition))
        plt.suptitle(gameid)
        fname = '{}.png'.format(gameid)
        plt.savefig(os.path.join(gallery_dir,fname))
        plt.close(fig)
    print('Done saving gallery figures to {}!'.format(gallery_dir))      
