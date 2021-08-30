# Using visual representations of physical mechanisms to identify how objects function

### Title
causaldraw_intervention

### Researchers
Holly Huey, Caren Walker, and Judith Fan

### Description
Causal knowledge allows us to make predictions about future events and act upon objects in order to generate desired outcomes[1-2]. Huey, Walker, and Fan (2020) collected a dataset of 300 sketches to explore visual communication as a means to convey causal knowledge to others in a condensed, exportable format. This study capitalized on prior work that has examined how the spatial layout of elements in well-designed visualizations, such as sketches, mirrors the placement and relations of elements in the physical world, making it easier to grasp the correspondence among elements in each domain[3-6]. Visualizations have also been shown to promote inference of abstract relations by leveraging a small set of relational symbols, such as lines and arrows[7-8]. 

In the original study, participants drew simple machines (gears, levers, and pulleys), which comprise a unique class of objects that can be rich in both visual appearance and causal information. They were prompted to generate visual explanations (e.g., of how a machine functions) or visual depictions (e.g., of what a machine looks like). Results demonstrated that, while participants tended to devote an approximately equal amount of ink and equal number of strokes between conditions, they drew a higher proportion of causally relevant elements in visual explanations than visual depictions (P<.001). Participants also employed more symbols and drew less background elements in their visual explanations (P<.001, respectively). Here we use “background” to describe the elements that were not did not contribute to the machines’ function. 

However, a critical aspect of understanding visual communication involves not only understanding how we produce visual representations but also how we use them. The current study will explore which visual properties of the collected sketches facilitate accurate inference about the machines’ causal structure and, therefore, correct invention on part of the machine required to operate them. The study will present a new group of participants with the sketches generated in the original study, as well as images of the original machines that the sketches were intended to represent. By measuring (1) whether participants can accurately infer which part of the machine they should intervene on to operate it, and (2) duration of their response time, the study aims to analyze which properties of sketches, such as which elements were drawn and the level of detail, differentially facilitate participants’ inference of the objects’ causal structure. 

## Study Information
### Hypotheses
If  participants of the original study (Huey, Walker, & Fan, 2020) were more selective when producing informative visual explanations than when producing faithful visual depictions, we hypothesize that visual explanations will contain more causally relevant information. Specifically: 

We predict visual explanations will enable more accurate identification of which part of the machine requires an intervention in order to operate it, relative to visual depictions.

We predict visual explanations will enable shorter response times than visual depictions. 

We predict sketches that contain more symbols will lead to more accurate inferences about how to operate the target machine and shorter response times. Here, the amount of symbols within a sketch will be determined by the total number of strokes used to depict symbols. 

We predict sketches that contain more causally relevant elements will lead to more accurate inferences about how to operate the target machine and shorter response times. These elements will be quantified by the  total number of strokes used to depict causally relevant elements. 

## Design Plan
### Study type
Experiment - A researcher randomly assigns treatments to study subjects. This is also known as an intervention experiment and includes randomized controlled trials

### Blinding
For studies that involve human subjects, they will not know the treatment group to which they have been assigned. 

### Is there any additional blinding in this study?
No response

### Study Plan
On a custom web-based platform, participants will be presented with sketches and images of the machines that the sketches represent. Each machine will consist of a unique spatial configuration of brightly colored mechanical elements, including gears, pulleys, and lever, that can be used to activate a light bulb. Half of these mechanical elements can be manipulated to activate the light (causal), whereas the other half of them cannot (non-causal). For each machine, these causal and non-causal elements will be equated in size, number, and type (gears, levers, and pulleys) to ensure that they are matched in perceptual salience. Machines will also vary by two levels of complexity. 

During test trials, participants will be presented with a single sketch for 5 seconds. After these 5 seconds, the sketch will be replaced by an image of the machine that the sketch represents. This image will remain on screen for 3 seconds and then will be replaced with a segmented image of the machine in which each distinct part of the machine will be colored and numbered by segmentation (e.g., a gear may be colored as blue and numbered as “1”). These numbers will correspond to the numbers 1-8 on participants’ keyboards. Participants will be instructed to place each finger, except their thumbs, on these numbers until instructed otherwise (e.g., the four fingers of the left hand will be placed on the numbers 1-4, and the four fingers of the right hand will be placed on the numbers 5-8). When participants see the segmented image of the machine, they will be asked to press the number on their keyboard that corresponds to the part of the machine that someone needs to intervene upon to activate the light using the machine. Participants will be instructed to respond as accurately and quickly as they can. 

Participants will complete 6 trials, in which each trial will be a different machine and level of complexity. Each session of 6 trials will contain an approximately equal number of visual explanations and visual depictions. 

To ensure that participants are familiar with the web interface and making responses on their keyboard, they will also complete practice trials in which they will see numbers appear on their screen. They will be instructed to press the number on their keyboard that corresponds to the number presented on their screen as accurately and quickly as they can. The numbers 1-8 will appear twice for a total of 16 trials. After these practice trials, participants will complete 3 more practice trials to gain experience with interpreting sketches. Just as in test trials, they will see a sketch for 5 seconds, image of a machine (in these practice trials, a “Bopit” toy) that the sketch represents for 3 seconds, and a segmented image of the machine. Upon seeing the segmented, they will be instructed to press the number on their keyboard that corresponds to the numbered part of the machine that someone must intervene on to operate the machine. 

## Sampling Plan
### Existing Data
Registration following analysis of the data: As of the date of submission, you have accessed and analyzed some of the data relevant to the research plan. This includes preliminary analysis of variables, calculation of descriptive statistics, and observation of data distributions. Please see cos.io/prereg for more information. 

### Data collection procedures
We plan to include 50 English-speaking adults. Participants will be recruited from the University of California, San Diego study pool through SONA and will receive 0.5 credit for their participants in our ~30 minute study. 

### Sample
We plan to include 50 English-speaking adults who did not participate in other studies of this visual communication series. 

### Sample size rationale
Because this is an exploratory study, we do not yet have reliable estimates of effect size. Our sample size was therefore chosen in order to obtain enough data to get initial estimates of effect size, as well as estimates of individual and item-level variation. This sample size rationale was also guided by a similar sample size of the original study (Huey, Walker, & Fan, 2020)

### Stopping rule
Data collection will stop when 50 participants have successfully completed the study.

## Variables
### Measured variables
We will analyze the effect of condition on two outcome variables: accuracy and response time.

## Analysis
### Statistical Models
Below are how we plan to specify each measured variable corresponding to the statistical model: 

Response time (RT)
First, we will attempt to fit the maximal versions of each model, including both random slopes and intercepts for participants (i.e., `orig_gameID`), items (i.e., `toy_type`), and sketch (i.e., `sketchID`). We will only analyze response times of trials in which participants responded accurately. 

m_fullRT <- lmer(log(final_data_RT$rt) ~ condition + condition*numCausal + condition*numFunctional + condition*numSymbol + condition*numBackground + (1|sketchID) + (1|toy_type) + (1|orig_gameID) + (totalStrokes|condition) + (totalStrokes|toy_type), data=final_data_RT, REML=FALSE)

If the model fails to converge, we will remove the random intercepts of toy_type and interactions with totalStrokes: 

m_reducedRT <- lmer(log(final_data_RT$rt) ~ condition + condition*numCausal + condition*numFunctional + condition*numSymbol + condition*numBackground + (1|sketchID) + (1|orig_gameID), data=final_data_RT, REML=FALSE)

Accuracy (corrAns)
Because corrAns is binary (0 = incorrect, 1 = correct), we will use a glmer model: 

m_fullcorrAns <- glmer(final_data$corrAns ~ condition + condition*numCausal + condition*numFunctional + condition*numSymbol + condition*numBackground + (1|sketchID) + (1|toy_type) + (1|orig_gameID) + (totalStrokes|condition) + (totalStrokes|toy_type), family="binomial", data=final_data, nAGQ=0)

If the model fails to converge, we will use the below: 

m_reducedcorrAns <- glmer(final_data$corrAns ~ condition + condition*numCausal + condition*numFunctional + condition*numSymbol + condition*numBackground + (1|sketchID) + (1|orig_gameID), family="binomial", data=final_data, nAGQ=0)

### Data exclusion
Sessions will be excluded from analysis based on the below exclusion criteria: 

Technical failure: Participants will complete an exit survey at the end of the experiment. If participants report that any of the sketches or images of machines did not display properly (e.g., images did not load or did not load at the same time) or if the interface did not function properly on a trial (e.g., trial did not advance after the participant made a keyboard response), all data from that session will be excluded from subsequent analysis. 

Session-level accuracy-based exclusion: 
All data from a session will be excluded if accuracy is than 50% (i.e., if participants correctly responded to only 3 out of the 6 test trials). 

3. Trial-level response time outlier exclusions: 
Absolute: To ensure that participants are making thoughtful decisions and not merely clicking through the task, trials will be excluded from subsequent analysis if the response time is less than 0.4 seconds. Trials will also be excluded from subsequent analysis if participants do not make a response in 10 seconds.  
Relative: Trials will be excluded if response times are greater than 2.5 standard deviations above the mean (using mean & sd on N-1 sample excluding that session).

We plan to release “raw” group dataframes containing all sessions and trials, but “flag” sessions and trials that meet our exclusion criteria to make it easy to filter these out during analysis. We further plan to apply the same analyses to both the raw & filtered datasets to evaluate the impact of our exclusion criteria on our conclusions. 

### Exploratory analysis
We plan to analyze how the level of sketch detail influences participant performance. On the one hand, it may be the case that more detail will assist participants in identifying parts of the machine and therefore will facilitate more accurate inferences about how to operate the target machine and shorter response times. On the other hand, it may be the case that sketches that are more sparse in detail are easier to infer more abstract knowledge, such as object function. In this case, sketches that contain less detail may facilitate more accurate inferences about how to operate the target machine and shorter response times. Here, the amount of detail will be measured by the  number of strokes and amount of “ink”, in which the amount of “ink” is measured by the arc length of the mark made between the depression of the mouse cursor (“pen down”) and the lifting of the mouse cursor (“pen up”).

Is it more important that visual explanations contain informative content (e.g., causally relevant elements) and/or that the content is spatially accurate to the referent? We also plan to analyze whether sketches that have a higher accuracy to spatial location, size, and shape of real-world elements will facilitate more accurate inferences about how to operate the target machine and shorter response times.

## Other
### Other
References
<br>
[1] Sloman, S. (2005). Causal models: how people think about the world and its alternatives. Oxford University Press.
<br>
[2] Meltzoff, A. (2007). Infants’ Causal Learning. Causal learning: psychology, philosophy, and computation, 37-47. Oxford University Press.
<br>
[3] Tversky, B., Agrawala, M., Heiser, J., Lee, P., Hanrahan, P., Phan, D., & Daniel, M. P. (2006). Cognitive design principles for automated generation of visualizations. In Allen G, editor. Applied Spatial Cognition: From Research to Cognitive Technology, 53-75. Hillsdale, NJ: Lawrence Erlbaum Associates, Inc. 
<br>
[4] Larkin, J., & Simon, H. (1987). Why a diagram is (sometimes) worth ten thousand words. Cognitive Science: A Multidisciplinary Journal, 11, 65–100.
<br>
[5] Tversky, B., & Bobek, E. (2016). Creating visual explanations improves learning. Cognitive Research: Principles and Implications, 1(1), 27.
<br>
[6] Tversky, B., & Morrison, J. B. (2002). Animation: can it facilitate? International Journal of Human-Computer Studies, 57, 247-262.
<br>
[7] Tversky, B., & Heiser, J., (2006). Arrows in comprehending and producing mechanical diagrams. Cognitive Science, 30, 581-592. 
<br>
[8] Tversky, B., Zacks, J., Lee, P., & Heiser, J. (2000). Lines, blobs, crosses and arrows: Diagrammatic communication with schematic figures. In International conference on theory and application of diagrams, 221-230. Springer, Berlin, Heidelberg.
