import os, sys

import pymongo as pm
import numpy as np
import scipy.stats as stats
import pandas as pd
import json
import re
from io import BytesIO
from PIL import Image
#from skimage import io, img_as_float
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

def extract_contingency_table_from_df(df, 
                                      expUnit = 'sketchID', 
                                      xvar = 'rt_annotationToKeyResponse',
                                      yvar = 'corrAns',
                                      num_xbins = 3,
                                      num_ybins = 2,
                                      render_heatmap = False,
                                      fig_width = 8,
                                      fig_height = 8,
                                      normed=True):

    '''
    Purpose: a more generic way of converting raw group dataframe into a contingency table 
             we supply two variables (xvar, yvar) that form the rows and columns of the contingency table

    Input: df = dataframe
           expUnit = what is the sampled unit we want to aggregate by? e.g., sketchID
           xvar = name of variable 1, e.g., RT
           yvar =  name of variable 1, e.g., correct
           num_xbins = int, how many quantiles do you want
           num_ybins = int, how many quantiles do you want 
           render_heatmap = bool, do we want to visualize a heatmap with the contingency values?
           normed = bool, do we want to return a table of counts (normed=False) or proportion (normed=True)?
    '''

    xvarbin = '{}_bin'.format(xvar)
    yvarbin = '{}_bin'.format(yvar)

    xlabels = np.arange(num_xbins)
    ylabels = np.arange(num_ybins)

    ## collapse raw dataframe (num_observations x num_attributes) to sketch-level dataframe (num_sketches x num_attributes)
    agg_df = df.groupby(expUnit)[[xvar, yvar]].mean().reset_index(drop=False)

    ## get quantile assignments 
    x_assignments = pd.qcut(agg_df[xvar], num_xbins, labels=xlabels, retbins = False)
    y_assignments = pd.qcut(agg_df[yvar], num_ybins, labels=ylabels, retbins = False)

    ## sanity checks (these should all reflect the number of sampled units, e.g., sketchIDs)
    assert len(y_assignments)==agg_df.shape[0]
    assert len(x_assignments)==df[expUnit].nunique()

    ## now add bin assignments to this dataframe
    agg_df = agg_df.assign(xbin = x_assignments, ybin = y_assignments)
    agg_df.rename(columns={'xbin':'{}_bin'.format(xvar), 'ybin':'{}_bin'.format(yvar)}, inplace=True)

    ## init heatmap with zeros
    mat = np.zeros((num_ybins, num_xbins))

    ## go through each row of the sketch dataframe and increment the corresponding cell by one
    for i,d in agg_df.iterrows():
        row_index = d[yvarbin]
        col_index = d[xvarbin]
        mat[row_index, col_index] += 1

    ## get proportions instead of counts    
    mat_normed = mat / agg_df.shape[0]

    ## define output var
    output = mat_normed if normed else mat
    
    if render_heatmap:
        ## generate heatmap
        plt.figure(figsize=(fig_width, fig_height))
        sns.heatmap(output, annot=True, cmap='viridis', square=True, cbar_kws={'shrink':0.8})  
        plt.xlabel(xvarbin)
        plt.ylabel(yvarbin)
        
    
    return output, agg_df

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