/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 * hijacked by Holly Huey for causaldraw_intervention to:
 * display multiple images (sketch, machine stimulus, and segemented reference image)
 * 
 * 2AFC version, using the numbers 1 & 0
 * 
 **/


jsPsych.plugins["image-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-keyboard-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      advance: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      // prompt: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   pretty_name: 'Prompt',
      //   default: null,
      //   description: 'Any content here will be displayed below the stimulus.'
      // },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    } // close params
  } // close plugin.info

  plugin.trial = function(display_element, trial) {

    // construct navigation path to PNGs
    trial.sketch_nav = 'data/run1/' + trial.sketch_id;
    console.log(trial.sketch_nav);
    trial.reference = 'stim/' + trial.toy_id + '_annotations_2AFC.png';
    trial.machine = 'stim/' + trial.toy_id + '_small.png';

    // trial.machine = 'stim/' + 'bopit_1_small.png';
    // trial.sketch_nav = 'stim/' + 'bopit_drawing3.png';
    // trial.reference = 'stim/' + 'bopit_1_annotations_2AFC.png';

    console.log('trial', trial);

    /////////////////////////////////////
    var html = '';

    // add container for text and columns
    html += '<div id="container">'

    // add conditional trial counter 
    if (trial.phase == "practice") {
      html += '<div id="trialNum" style="color: white;"> ' + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
    } // hide practice trialNum
    else if (trial.phase == "intervention") {
      html += '<div id="trialNum" style="color: black;"> ' + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
    };

    // add row 1 for instructions
    html += '<div class="row">'
    html += '<div id="instructionsContainer">'
    html += '<div id="segmentInstructions" class="instructions">'
    html += "<p>Keep your fingers on the numbers 1 and 0.</p>"
    html += '</div>' // close segmentInstructions

    html += '<div id="spacebarInstructions" class="instructions">'
    html += "<p>Press the spacebar when you're ready to see the reference picture.</p>"
    html += '</div>' // close segmentInstructions

    // add conditional prompt
    if (trial.phase == "practice") {
      html += '<div id="prompt" class="instructions">'
      html += '<p>Which part should someone move to operate the machine?<p>'
      html += '</div>' // close instructions
    } // switch prompt text
    else if (trial.phase == "intervention" || trial.phase == "intervention_patch") {
      html += '<div id="prompt" class="instructions">'
      html += '<p>Which part of the machine needs to be moved to turn the light on?<p>'  //Which part of the machine needs to be moved to turn the light on
      html += '</div>' // close instructions
    };
    html += '</div>' // close instructionsContainer
    html += '</div>' // close row

    // add row 2 for stimuli
    html += '<div class="row">'

    // add column 1 for machine image
    // html += '<div id="sketchContainer">'
    html += '<div class="col">'
    html += '<div id="machine-container">'
    html += '<img id="machine" class="stimuli" src="' + trial.machine + '">';
    html += '</div>' // close machine-container
    html += '</div>' // close col

    html += '<div class="col">'
    html += '<img id="jspsych-image-keyboard-response-stimulus" class="stimuli" src="' + trial.sketch_nav + '">';
    html += '</div>' // close col

    html += '<div class="col">'
    html += '<div id="reference-container">'
    html += '<img id="reference" class="stimuli" src="' + trial.reference + '">';
    html += '</div>' // close reference-container
    html += '</div>' // close col
    // html += '</div>' // close sketchContainer
    html += '</div>' // close row of sketch column

    // add row 3 for schematic hands image
    html += '<div class="row">'
    html += '<div id="hands-container">'
    html += '<img id="hands" class="keyboardImgs_test" src="stim/keyboard_darkHands_2AFC.png">';
    html += '</div>' // close reference-container
    html += '</div>'

    html += '</div>' //close container of text and columns

    // render
    display_element.innerHTML = html;

    /////////////////////////////////////
    // set global variables
    var turkInfo = jsPsych.turk.turkInfo();   

    var start_trial, show_sketch, show_annotation, keyboard_response;

    // timestamp start of trial
    start_trial = Date.now();

    setTimeout(function() {
      // $('#jspsych-image-keyboard-response-stimulus').hide();
      showSketch();
    }, 3000); // close setTimeout — show sketch for 5s

    function showSketch() {
      $('#jspsych-image-keyboard-response-stimulus').show();
      display_element.querySelector('#machine').style.border = '2px solid #999';
      display_element.querySelector('#jspsych-image-keyboard-response-stimulus').style.border = '10px solid #303030'; 
      // $('#segmentInstructions').hide();
      // $('#spacebarInstructions').show();

      show_sketch = Date.now();
      console.log('show_sketch', show_sketch);


      setTimeout(function() {
        showAnnotation();
        }, 3000)

      // if (trial.advance != jsPsych.NO_KEYS) {
      //   var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      //     callback_function: showAnnotation,
      //     valid_responses: trial.advance,
      //     rt_method: 'performance',
      //     persist: false,
      //     allow_held_key: false
      //   }); 
      // } // close if statement

      // setTimeout(function() {
        // showAnnotation();
      // }, 1000)
    }; // close showMachine – show orig machine image for 5s

    var showAnnotation = function(info) {
        // show sketch upon 'spacebar' press
        $('#reference').show();
        display_element.querySelector('#jspsych-image-keyboard-response-stimulus').style.border = '2px solid #999';
        display_element.querySelector('#reference').style.border = '10px solid #303030'; 
        
        // timestamp when participants presses spacebar to see the stimulus
          show_annotation = Date.now();

        // switch instructions text
        // $('#spacebarInstructions').hide();
        $('#segmentInstructions').hide();
        $('#prompt').show();

      if (trial.choices != jsPsych.NO_KEYS) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      } // close if statement
    };

    // function showAnnotation() {
    //   // show sketch upon 'spacebar' press
    //   if (show_sketch != undefined) {
    //     $(window).keypress(function (event) {
    //       if (event.key === ' ' || event.key === 'Spacebar') {
    //         event.preventDefault();
    //         $('#reference').show();

    //         // timestamp when participants presses spacebar to see the stimulus
    //         show_annotation = Date.now();

    //         // switch instructions text
    //         $('#spacebarInstructions').hide();
    //         $('#prompt').show();

    //         if (trial.choices != jsPsych.NO_KEYS) {
    //           var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
    //             callback_function: after_response,
    //             valid_responses: trial.choices,
    //             rt_method: 'performance',
    //             persist: false,
    //             allow_held_key: false
    //           }); 
    //         } // close if statement
    //       }
    //     });
    //   } else if (show_sketch == undefined) {
    //     return
    //   };
    // }; // close showAnnotation

    // function showAnnotation() {
    //   // $('#machine').hide();
    //   $('#reference').show();
      
    //   // switch instructions text
    //   $('#segmentInstructions').hide();
    //   $('#prompt').show();

    //   // start timer when participant see annotation image
    //   start_rt_timer = Date.now();
    //   // time_elapsed_beforeReference = start_rt_timer - start_trial;
    //   // console.log('time elapsed', time_elapsed_beforeReference);
    // }; // close showAnnotation

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      keyboard_response = Date.now();
      // rt_sketchToSpacebar = show_annotation - show_sketch;
      rt_annotationToKeyResponse = keyboard_response - show_annotation;

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = _.extend({}, trial, {
        // rt: response.rt,
        timeMachinePresented: start_trial,
        timeSketchPresented: show_sketch,
        keyboard_response: keyboard_response,
        timeAnnotationPresented: show_annotation,
        // rt_sketchToSpacebar: rt_sketchToSpacebar, 
        rt_annotationToKeyResponse: rt_annotationToKeyResponse,
        machine: trial.machine,
        key_press: selected_roi,
        wID: turkInfo.workerId, 
        hitID: turkInfo.hitId, 
        aID: turkInfo.assignmentId, 
        eventType: 'intervention'
      });

      console.log('currentData', trial_data);
      // socket.emit('currentData', trial_data);

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      display_element.innerHTML = "<p>Fetching another machine for you!";
      jsPsych.finishTrial(trial_data);
    }; // close end_trial

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#jspsych-image-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }; 

      // convert keycodes of pressed keyboardNums into ROIs
      if (response.key == 49) {
        selected_roi = 1
      } else if (response.key == 48) {
        selected_roi = 0
      // } else if (response.key == 50) {
      //   selected_roi = 2
      // } else if (response.key == 51) {
      //   selected_roi = 3
      // } else if (response.key == 52) {
      //   selected_roi = 4
      // } else if (response.key == 53) {
      //   selected_roi = 5
      // } else if (response.key == 54) {
      //   selected_roi = 6
      // } else if (response.key == 55) {
      //   selected_roi = 7
      // } else if (response.key == 56) {
      //   selected_roi = 8
      };

      if (trial.response_ends_trial) {
        end_trial();
      }
    }; // close after_response

    /////////////////////////////////////
    // start the response listener AFTER partcipant sees sketch, machine, then reference
    // setTimeout(function() {
      // if (trial.choices != jsPsych.NO_KEYS) {
      //   var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      //     callback_function: after_response,
      //     valid_responses: trial.choices,
      //     rt_method: 'performance',
      //     persist: false,
      //     allow_held_key: false
      //   });
      // } // close if statement
  //  }, 8000); // close setTimeout — note! this 8000ms is the length of time of presented sketch and machine

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-keyboard-response-stimulus').style.display = 'none';
      }, trial.stimulus_duration);
    } // close if statement

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    } // close if statement

  }; // close plugin.trial function

  return plugin;
})(); // close entire plugin