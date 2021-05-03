/**
 * jspsych-cued-drawing
 * 
 * This is a plugin for displaying a cue and getting drawing response in a canvas
 * 
 **/

jsPsych.plugins["jspsych-cued-drawing"] = (function () {

  var plugin = {};

  plugin.info = {
    name: "jspsych-cued-drawing",
    parameters: {
      toy_type: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'toy_type',
        default: undefined,
        description: 'The label used to cue drawing.'
      },
      cue_html: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'video cue',
        // note: added id 'cue' to later measure duration of stim_url
        default: '<video height="500" autoplay id="cue"> <source src="stim_url" type="video/mp4" id="cue_html">',
        array: true,
        description: 'The html of the video cue used to prompt drawing. Can create own style.'
      },
      stim_url: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'stim_url',
        default: undefined,
        array: true,
        description: 'The URL for the video cue.'
      },
      cue_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'cue_duration',
        default: 1000,
        description: 'How long to show the cue (in milliseconds).'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'prompt',
        default: null,
        description: 'What to display to the participant as the instructions.'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    // TODO: put this short video url someplace else
    devModeCue = 'https://causaldraw-test.s3.amazonaws.com/causaldraw_short.mp4'

    // Initialize global variables
    var startTrialTime, startResponseTime, startStrokeTime, endStrokeTime, endTrialTime, sketchpad; //stopStrokeTime, //removing for EXP1A

    // Connect db trials to html parameters
    trial.toy_type = trial['toy_type']

    // Check that the correct url is being selected
    console.log(trial["stim_url", 'stim_url']);

    // Print errors if the parameters are not correctly formatted
    if (typeof trial.toy_type === 'undefined') {
      console.error('Required parameter "toy_type" missing in jspsych-cued-drawing');
    }

    // Wait for a 1500ms for data to come back from db, then show_display
    setTimeout(function () {
      show_cue();
    }, 2500);

    // Print 'trial' info for debugging
    // console.log('trial', trial);
    // console.log('trial', trial['toy_type']);

    // Wrapper function to show cue, this is called when you've waited as long as you
    // reckon is long enough for the data to come back from the db
    function show_cue() {

      var html = '';

      // Create sketchpad
      html += '<div id="sketchpad_container" style="display:none">';
      html += '<canvas id="sketchpad" style="display:none"></canvas>';
      html += '</div>';

      // Create inkLeft counter for participants to see how much ink they have left
      html += '<div id="inkLeft_container" style="display:none">';
      html += '<div id="inkLeft_bar_inner" style="display:none"></div>';
      html += '</div>';

      // Create anthropologist and museumcurator for whom to draw
      html += "<div><img height='400' src='stim/alien_explain.png' id='alien_explain' style='display:none'></div>";
      html += "<div><img height='400' src='stim/alien_depict.png' id='alien_depict' style='display:none'></div>";

      // Display toy label
      html += '<div id="label_container" style="display:none"><p id="toy_type"> "' + trial.toy_type + '"</p></div>';

      // Check what condition and display correct prompt message
      if (trial.condition == "depictive") {
        trial['prompt'] = '<coldep>Draw what this artifact <i>looks like</i> for the blue alien!</coldep>'
      } else {
        trial['prompt'] = '<colexp>Draw how this artifact <i>functions</i> for the red alien!</colexp>'
      };

      // Display prompt message
      html += '<div id="prompt_container" style="display:none"><p id="prompt"> "' + trial.prompt + '"</p></div>';
      // html += '<div id="prompt_flashing" style="display:none"></div>';

      // Place cue video inside the cue video container (which has fixed location)
      html += '<div id="cue_container" style="display:none">';
      var cue_html_replaced = trial.dev_mode ? trial.cue_html.replace('stim_url', devModeCue) : trial.cue_html.replace('stim_url', trial.stim_url);
      // console.log('trial inside show_cue',trial.file_id);
      html += cue_html_replaced;
      html += '</div>';

      // Display 'submit_button' to submit drawing when finished
      html += '<button id="submit_button" class="green" style="display:none"> submit </button>'

      // Actually assign html to display_element.innerHTML
      display_element.innerHTML = html;

      // Reset global current stroke number variable
      currStrokeNum = 0;

      // Record trial start timestamp
      startTrialTime = Date.now();

      // Add event listener to submit button once response window opens
      submit_button.addEventListener('click', end_trial);
      submit_button.disabled = true; // note: button is disabled until at least one stroke

      // Show the LABEL and VIDEO cues
      jsPsych.pluginAPI.setTimeout(function () {
        //$('#label_container').fadeIn('fast'); 

        // Show video cue
        $('#cue_container').fadeIn('fast');

        // Show prompt cues
        $('#prompt').fadeIn('fast');
        $('#prompt_container').fadeIn('fast');
        // $('#prompt_flashing').fadeIn('fast');
      }, 100);

      // Add event listener to 'cue': run function 'hideCue' after the VIDEO cue is done playing
      jsPsych.pluginAPI.setTimeout(function () {
        document.getElementById('cue').addEventListener('ended', hideCue, false);
      });
    };

    // Hide VIDEO cue and run function 'show_cavas'
    function hideCue() {
      $('#cue_container').fadeOut('fast');
      show_canvas();
    };

    // Show SKETCHPAD cues
    function show_canvas() {

      // Instantiate new sketchpad and tool
      sketchpad = new Sketchpad();
      tool = new Tool(); // create new tool
      sketchpad.setupTool();

      // Record timestamp for start of response window
      startResponseTime = Date.now();

      // Show the submit button
      $('#submit_button').fadeIn('fast');
      $('#sketchpad').fadeIn('fast');
      $('#sketchpad_container').fadeIn('fast');
      // $('#prompt_flashing').hide();

      // Show person for whom to draw
      if (trial.condition == "depictive") {
        $('#alien_depict').fadeIn('fast');
      } else {
        $('#alien_explain').fadeIn('fast');
      }
      

      // Delay show the SKETCHPAD and SKETCHPAD_CONTAINER cues
      // setTimeout(minifunction, 3000);

      // function minifunction() {
      //   $('#sketchpad').fadeIn('fast');
      //   $('#sketchpad_container').fadeIn('fast');
      //   $('#prompt_flashing').hide();
      // }

      // Show inkLeft progressbar counter
      // Commenting this out for EXP1A, but this is the stroke budget for EXP1B
      // $('#inkLeft_container').fadeIn('fast');
      // $('#inkLeft_bar_inner').fadeIn('fast');

      // take a look at what trial obj looks like after the cue has finished playing at least
      // console.log('trial obj inside show_canvas',trial.file_id);
    };

    // Actually send stroke data back to server to save to db
    function send_stroke_data(path) {
      // path.selected = false;
      var svgString = path.exportSVG({ asString: false }).getAttribute('d');
      // get info from mturk
      var turkInfo = jsPsych.turk.turkInfo();

      // Specify other metadata
      stroke_data = _.omit(_.extend({}, trial, {
        dbname: trial.dbname,
        colname: trial.colname,
        iterationName: trial.iterationName,
        eventType: 'stroke',
        workerId: turkInfo.workerId,
        hitID: turkInfo.hitId,
        aID: turkInfo.assignmentId,
        svg: svgString,
        arcLength: path.length,
        currStrokeNum: currStrokeNum,
        simplifyParam: simplifyParam,
        startResponseTime: startResponseTime,
        startStrokeTime: startStrokeTime,
        endStrokeTime: endStrokeTime,
        //stopStrokeTime: stopStrokeTime, //removing for EXP1A
        time: Date.now()
      }), ['cue_html', 'cue_duration', 'inkLeft']);

      console.log('stroke_data', stroke_data);
      // Send stroke data to server — woot woot! 
      socket.emit('stroke', stroke_data);

    }

    // Triggered either when submit button is clicked or time runs out
    // Sends trial data to database
    function end_trial() {

      // Disable submit button to prevent double firing
      submit_button.disabled = true;

      // Sketch rendering to base64 encoding
      var dataURL = display_element.querySelector('#sketchpad').toDataURL();
      dataURL = dataURL.replace('data:image/png;base64', '');
      // get info from mturk
      var turkInfo = jsPsych.turk.turkInfo();

      // Data saving
      var trial_data = _.extend({}, trial, {
        dbname: trial.dbname,
        colname: trial.colname,
        iterationName: trial.iterationName,
        eventType: 'sketch',
        numStrokes: currStrokeNum,
        workerId: turkInfo.workerId,
        hitID: turkInfo.hitId,
        aID: turkInfo.assignmentId,
        pngData: dataURL,
        startTrialTime: startTrialTime,
        endTrialTime: Date.now()
      });

      // Clear the HTML in the display element
      display_element.innerHTML = '';

      // Clear sketchpad canvas and reset drawing state vars
      project.activeLayer.removeChildren();

      // End trial
      jsPsych.finishTrial(trial_data);
      console.log('data saved to the database!');
      drawingAllowed = true;
    }

    ///////// DRAWING PARAMS ///////////

    // Initialize global variables
    var drawingAllowed = true;
    var submitAllowed = false; // allow submission once there is at least one stroke
    var strokeColor = 'black';
    var strokeWidth = 5;
    var simplifyParam = 10;
    var currStrokeNum = 0;

    ///////// CORE DRAWING FUNCTIONS ///////////

    function Sketchpad() {
      // Initialize paper.js
      paper.setup('sketchpad');
      paper.view.viewSize.width = 500; //note: this must match dimensions in jspych.css
      paper.view.viewSize.height = 500; //note: this must match dimensions in jspych.css
      drawingAllowed = true;
      // console.log('trial inside Sketchpad() definition', trial.file_id);
    };

    Sketchpad.prototype.setupTool = function () {
      // Initialize path
      var path;

      // Define mouse interaction events
      tool.onMouseDown = function (event) {
        startStroke(event);
        // console.log('trial obj inside onMouseDown',trial);
      }

      tool.onMouseUp = function (event) {
        endStroke(event);
      }

      // Define stroke budget function (drawing end at 300px in total) 
      // EXP1A does not have a stroke budget -- uncomment this for EXP1B
      tool.onMouseDrag = function (event) {
        stopStroke(event);
      }

      // Define startStroke
      function startStroke(event) {
        if (drawingAllowed) {
          startStrokeTime = Date.now();
          // If a path is ongoing, send it along before starting this new one
          if (!_.isEmpty(path)) {
            endStroke(event);
          }

          var point = (event ? event.point.round() : {
            x: currMouseX,
            y: currMouseY
          });
          path = new Path({
            segments: [point],
            strokeColor: strokeColor,
            strokeWidth: strokeWidth
          });
        }
      };

      // Define endStroke
      function endStroke(event) {
        // Only send stroke if actual line (single points don't get rendered)
        if (drawingAllowed && path.length > 1) {

          // Allow submission of button if endStroke is called
          submit_button.disabled = false;

          // Record end stroke time
          endStrokeTime = Date.now();

          // Increment stroke num
          currStrokeNum += 1;

          // Simplify path to reduce data sent
          path.simplify(simplifyParam);

          // Send stroke data to db
          send_stroke_data(path);

          // Reset path
          path = [];
        }
      };


      // EXP1A does not include the stroke budget —— uncomment this for EXP1B
      function stopStroke(event) {
        // Only send stroke if actual line (single points don't get rendered)
        if (drawingAllowed && !_.isEmpty(path)) {
          var point = event.point.round();
          currMouseX = point.x;
          currMouseY = point.y;
          path.add(point);
          trial['inkLeft']--;

          // console.log(trial['inkLeft']);
          var elem = document.getElementById("inkLeft_bar_inner");
          if (trial['inkBudgetWidth'] >= 0) { //note: this must match the inkLeft limit
            trial['inkBudgetWidth'] -= 1;
            elem.style.width = trial['inkBudgetWidth'] + '%';
            elem.innerHTML = trial['inkBudgetWidth'] * 1 + '%'; //note: change the fraction % added to inkLeft bar (e.g. 300 limit but adds .33ink = 33%)???
          }

          if (trial['inkLeft'] == 0) {
            drawingAllowed = false;
            console.log('oops no more ink');
            console.log('this trial', trial);
            submit_button.disabled = false;
            stopStrokeTime = Date.now();
            //path.simplify(simplifyParam);
            send_stroke_data(path);
            path = [];
          }
        }
      }

    };

  };

  return plugin;
})();
