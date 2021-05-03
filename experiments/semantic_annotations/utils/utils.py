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
    
from glob import glob
import os, sys
import numpy as np
import re

import boto3
import botocore

    
def list_files(path, ext='png'):
    result = [y for x in os.walk(path) for y in glob(os.path.join(x[0], '*.%s' % ext))]
    return result

def tryint(s):
    try:
        return int(s)
    except ValueError:
        return s
     
def alphanum_key(s):
    """ Turn a string into a list of string and number chunks.
        "z23a" -> ["z", 23, "a"]
    """
    return [ tryint(c) for c in re.split('([0-9]+)', s) ]

def sort_nicely(l):
    """ Sort the given list in the way that humans expect.
    """
    l.sort(key=alphanum_key)   
    
def check_exists(s3, bucket_name, stim_name):
    '''
    helper to speed things up when uploading to S3 
    by not uploading images if they already exist, can be overwritten
    '''
    try:
        s3.Object(bucket_name,stim_name).load()    
        return True
    except botocore.exceptions.ClientError as e:    
        if (e.response['Error']['Code'] == "404"):
            print('The object does not exist.')
            return False
        else:
            print('Something else has gone wrong with {}'.format(stim_name))   

def generate_s3_url(path_to_stim, bucket_name='causaldraw-annotations'):
    
    ## get list of full stim paths
    full_stim_paths = list_files(path_to_stim)    
    
    ## now let's loop through stim paths and actually upload to s3 (woot!)
    ref_urls = []
    for i,path_to_file in enumerate(full_stim_paths):
        stim_name = path_to_file.split('/')[-1]  
        url = 'https://{}.s3.amazonaws.com/{}'.format(bucket_name,stim_name)
        ref_urls.append(url)
    return ref_urls            
            
            
def upload_stims_to_s3(path_to_stim, bucket_name, overwrite=True):
    '''
    uploads images to Amazon AWS S3 Secure Storage service    
    depends on list_files and check_exists functions
    '''
    ## tell user some useful information    
    print('Path to stimuli is : {}'.format(path_to_stim))
    print('Uploading to this bucket: {}'.format(bucket_name))

    ## establish connection to s3 
    s3 = boto3.resource('s3')

    ## create a bucket with the appropriate bucket name
    try: 
        b = s3.create_bucket(Bucket=bucket_name) 
        print('Created new bucket.')
    except:
        b = s3.Bucket(bucket_name)
        print('Bucket already exists.')

    ## do we want to overwrite files on s3?
    overwrite = True
    
    ## set bucket and objects to public
    b.Acl().put(ACL='public-read') ## sets bucket to public
    
    ## get list of full stim paths
    full_stim_paths = list_files(path_to_stim)    
    
    ## init list of stim_urls to return to user
    stim_urls = []

    ## now let's loop through stim paths and actually upload to s3 (woot!)
    for i,path_to_file in enumerate(full_stim_paths):
        stim_name = path_to_file.split('/')[-1]
        if ((check_exists(s3, bucket_name, stim_name)==False) | (overwrite==True)):
            print('Now uploading {} | {} of {}'.format(path_to_file.split('/')[-1],(i+1),len(full_stim_paths)))
            s3.Object(bucket_name,stim_name).put(Body=open(path_to_file,'rb')) ## upload stimuli
            s3.Object(bucket_name,stim_name).Acl().put(ACL='public-read') ## set access controls
        else: 
            print('Skipping {} | {} of {} because it already exists.'.format(path_to_file.split('/')[-1],(i+1),len(full_stim_paths)))
        clear_output(wait=True)
        stim_urls.append('https://{}.s3.amazonaws.com/{}'.format(bucket_name,stim_name))            

    print('Done uploading images!')
    return stim_urls            