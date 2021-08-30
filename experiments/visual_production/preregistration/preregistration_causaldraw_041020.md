# Pregistration for visual_production experiment

**Researchers**: Holly Huey, Caren M. Walker, and Judith E. Fan

## Study information
**Title**: 
causaldraw

### Research questions

Our ability to learn the causal structure of the world is a fundamental aspect of human intelligence. 
This causal knowledge allows us to predict future events and perform actions to generate desired outcomes[1-2]. 
However, acquiring such knowledge directly from the world is costly in both time and effort[3-4]. 
Thus, it is vital to transmit already acquired causal knowledge effectively, 
in order to facilitate quick decision-making and advance collective understanding[5-6]. 

The present study explores visualizations as a means overcoming these limitations by conveying 
causal knowledge in a condensed, exportable format over large gaps in space and time. 
We capitalize on prior work that has examined how the spatial layout of elements in well-designed visualizations 
mirrors the placement and relations of elements in the physical world, making it easier to grasp the correspondence 
among elements in each domain[7-10].
Visualizations have also been shown to promote inference of abstract relations by leveraging a small set of relational symbols, such as lines and arrows[11-12]. 

In particular, participants will draw simple machines (gears, levers, and pulleys), 
which comprise a unique class of objects that can be rich in both visual appearance and causal information. 
The study thus explores how prompts to generate visual explanations (e.g., of how a machine functions) or visual depictions 
(e.g., of what a machine looks like) may affect what participants choose to include in their drawings. 
Specifically, the study probes drawing behavior by examining how factors such as ink usage, number of strokes, and drawing time differ between conditions. 


### Hypotheses
If  participants are more selective when producing informative visual explanations than when producing faithful visual depictions, 
we hypothesize that visual explanations will contain less detail than visual depictions. 
Specifically:

1. We predict that participants will use less “ink” in their visual explanations vs. visual depictions, 
measured by the mean pixel intensity of grayscale renderings of sketches produced in each condition.

<br>

2. We predict that participants will use fewer strokes in their visual explanations vs. visual depictions, 
where each stroke is defined as the mark made between the depression of the mouse cursor (“pen down”) and the lifting of the mouse cursor (“pen up”). 

<br> 

3. We predict that participants will spend less time drawing while producing visual explanations vs. visual depictions, 
defined as the time elapsed between the initiation of the first stroke and the completion of the final stroke of each sketch.

## Design Plan
###   Study type
Experimental
 
###   Study design
Participants will complete a causal learning and visualization task on a custom web-based sketching platform. 
On each trial, participants will first be presented with a video demonstration of how to operate a novel machine 
consisting of simple mechanical elements (i.e., gears, levers, pulleys) to activate a light bulb. 
Following each video demonstration, participants will be prompted to produce a sketch of the machine. 
Each machine will be trial-unique and characterized by a unique spatial configuration of brightly colored mechanical elements, 
including gears, pulleys, and levers. Half of these mechanical elements can be manipulated to activate the light (causal), 
whereas the other half of them cannot (non-causal). 
For each machine, these causal and non-causal elements will be equated in size, number, and type (gears, levers, and pulleys) 
to ensure that they are matched in perceptual salience. 

In addition to type, machines will also vary by two levels of complexity and the demonstration order by which causal 
and non-causal elements  are manipulated, which follow either an “ABBA” or “BAAB” pattern. 
The stimuli are thus a 2x2x3 design for a total of 12 unique videos. 
Demonstration order will be randomized, and participants thus will be presented with and tasked to draw 6 machines. 
These 6 machines will be randomly assigned to either the explanation or depiction condition. 

On explanation trials, participants will be prompted to produce a sketch to explain to someone else how to activate the light. 
On depiction trials, participants will be prompted to produce a sketch that depicts the machine’s appearance so that someone else could identify it. 

#### Data Validation

90 participants, who did not participate in the original experiment and are naive to our research hypotheses, 
will be recruited from MTurk to judge the validity of our drawing data. Each validation participant will be randomly assigned 1 of 6 machines. 
After watching the video demonstration, this participant will be shown a sequence of 10 drawings of that machine, randomly sampled from the original dataset. 
For each drawing, their task will be to judge if each drawing is valid, defined as appearing to be a legitimate attempt to represent that machine. 
Valid drawings do not need to include all elements of the machine shown in the video demonstration nor be accurate in shape, size, or location of elements 
(e.g., a blob may denote an element of the machine as long as that correspondence is apparent to participants). 
Participants may also judge a drawing to be invalid, defined as appearing to represent something else (e.g., a different machine, a different object) 
or represent nothing at all (e.g., scribbles). 
Prior to viewing the video demonstration and their set of 10 drawings, participants will be shown examples of valid and invalid drawings 
so that they understand the validation criteria. 

Each drawing will be validated by 3 different participants. 
Drawings that are considered valid by at least 2 out of 3 of them will be retained for subsequent analysis.  


## Sampling Plan
###   Data collection proceedures

Participants will be recruited from Amazon Mechanical Turk (MTurk) and will receive $3.00 for their participation in our ~15 minute study (approx. $12/hr). 

###   Sample size

We plan to include 50 English-speaking adults.
Because this is an exploratory study we do not yet have reliable estimates of effect size, so this sample size was chosen in order to obtain enough data 
to get initial estimates of effect size, as well as estimates of individual & item-level variation. 
This sample size is also in the same ballpark as other related studies of visual production (e.g., Hawkins et al., 2019). 

## Analysis Plan
###   Measured variables
We will analyze the effect of condition on three outcome variables: 
the amount of “ink” (i.e., mean pixel intensity of sketches), 
the number of strokes, 
and the amount of time spent producing each drawing.

###   Statistical models
Below are how we plan to specify each measured variable corresponding to the statistical model:

1. Amount of “ink” (i.e., mean pixel intensity)
First, we will attempt to fit the “maximal” versions of each model, 
including both random slopes and intercepts for participants (i.e., `gameID`) and items (i.e., `toy_type`):

lmer(pxIntensity_avg ~ condition + (1 + condition | gameID) +  (1 + condition | toy_type), data = sketch_dat)

If this model fails to converge, we will remove the random slopes and use the 
following model containing only random intercepts for participants (i.e., `gameID`) and items (i.e., `toy_type`):

lmer(pxIntensity_avg ~ condition + (1 | gameID) +  (1 | toy_type), data = sketch_dat)

2. Number of strokes
Likewise for numStrokes, we will first attempt to fit the maximal model 
(i.e., random slopes and intercepts for both participant and item). 
If the maximal model fails to converge, we will specify a simpler model that only contains random intercepts for participants and items.

lmer(numStrokes ~ condition + (1 + condition | gameID) +  (1 + condition | toy_type) , data = sketch_dat)

3. Drawing time of sketch
Likewise for drawingTime: 

lmer(drawingTime ~ condition + (1 + condition | gameID) +  (1 + condition | toy_type), data = sketch_dat)

###   Data exclusion
Sessions will be excluded from analysis based on the below exclusion criteria:

1) Missing data: If a session is missing at least 2 drawings out of 6, 
all data from that session will be excluded from subsequent analysis. 

2) Technical failure: 
Participants will complete an exit survey at the end of the experiment. 
If participants report that any of the videos did not display properly 
(e.g., videos freeze intermittently or do not load) or if the drawing interface did not function properly on a trial 
(e.g., cursor could not draw), their data will be excluded from subsequent analysis.

3) Failure to generate complete drawings: 
If at least 2 drawings out of 6 consist of a single stroke, all data from that session will be excluded from subsequent analysis. 
This will ensure that the data collected includes participants that fully dedicated themselves to the task at hand. 

4) Invalid drawings: 
If a session contains at least 2 drawings out of 6 that are considered invalid by at least 2 out of 3 validation participants, 
all data from that session will be excluded from subsequent analysis. 
This reflects the heightened possibility that the same technical/motivational issue affecting the validity of one drawing may have 
also applied to the remainder of trials in that session.
