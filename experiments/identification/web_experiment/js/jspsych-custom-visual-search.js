/**
 *
 * jspsych-custom-visual-search
 *
 * display a set of objects, with or without a sketch target, equidistant from fixation
 * subject clicks on the object that matches the sketch target
 *
 * based on code written for jspsych-visual-search-circle (for psychtoolbox by Ben Motz)
 *
 **/

jsPsych.plugins['jspsych-custom-visual-search'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-custom-visual-search',
    parameters: {
      //fixation
      fixation_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Fixation image',
        default: undefined,
        description: 'Path to image file that is a fixation target.'
      },
      fixation_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation size',
        array: true,
        default: [16, 16],
        description: '2 elem array indicating the height/width of fixation image.'
      },
      //sketch
      sketch_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sketch size',
        array: true,
        default: undefined,
        description: '2 elem array indicating the height/width of sketch target.'
      },
      //stimuli
      targets: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Array of stimuli',
        array: true,
        default: undefined,
        description: 'array of target stimuli.'
      },
      targets_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'target size',
        array: true,
        default: [125, 100],
        description: '2 elem array indicating the height/width of target images.'
      },
      target_delay_max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Delay max',
        default: 0,
        description: 'Maximum ms that target display will be displayed.'
      },
      target_delay_min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Delay min',
        default: 0,
        description: 'Minimum ms that target display will be displayed.'
      },
      circle_radius: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Circle radius',
        default: 250,
        description: 'Radius of the search array circle in pixels.'
      }
    } //close parameters
  } // close plugin.info

  plugin.trial = function(display_element, trial) {
    // data for single trial already loaded
    // see this line in index.html:
    // <script type="text/javascript" src="data/example.json"></script>

    // construct navigation path to PNGs
    trial.sketch_nav = 'data/run1/' + trial.sketch_id;
    trial.phase = trial.phase;
    console.log('trial', trial);

    /////////////////////////////////////
    // target circle params
    var radius = trial.circle_radius,
      diam = radius * 2,
      paper_size = diam + trial.targets_size[0];

    // stimuli width, height
    var stimh = trial.targets_size[0],
      stimw = trial.targets_size[1],
      hstimh = stimh / 2,
      hstimw = stimw / 2;

    // calculate fixation location
    var fix_loc = [
      Math.floor(paper_size / 2 - trial.fixation_size[0] / 2),
      Math.floor(paper_size / 2 - trial.fixation_size[1] / 2)
    ];

    // calculate target sketch location
    var sketch_loc = [
      Math.floor(paper_size / 2 - trial.sketch_size[0] / 2),
      Math.floor(paper_size / 2 - trial.sketch_size[1] / 2)
    ];

    /////////////////////////////////////
    // make empty html to build on
    var html = '';
    html += '<div id="fix_instructions"><p>Click the crosshair. <u>Keep</u> your cursor on it until it disappears.</p></div>'

    // note to self: since I couldn't figure out how to enumerate the 6 practice trials, I hide trialNum by making the color white
    if (trial.phase == "practice") {
      html += '<div id="trialNum" style="color: white;"> ' + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
    } else if (trial.phase == "identification") {
      html += '<div id="trialNum" style="color: #999;"> ' + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
    };

    display_element.innerHTML = html;

    // add response time after click as feedback
    display_element.innerHTML += '<div id="rt"> \
      </div>';

    // make container for target display
    display_element.innerHTML += '<div id="visual-search-circle-container" \
      style="position: relative; \
      width:' + paper_size + 'px; \
      height:' + paper_size + 'px; \
      border: 2px solid white;"> \
      </div>';

    var display = display_element.querySelector("#visual-search-circle-container");

    // add fixation at center of stimuli array (within target display)
    display.innerHTML += "<img id='crosshair' src='" + trial.fixation_image + "' \
      style='position: absolute; \
      top:" + fix_loc[0] + "px; \
      left:" + fix_loc[1] + "px; \
      width:" + trial.fixation_size[0] + "px; \
      height:" + trial.fixation_size[1] + "px;'>";

    // add sketch at center of stimuli array (within target display)
    display.innerHTML += "<img id='myCanvas' src='" + trial.sketch_nav + "' \
      style='position: absolute; \
      top:" + sketch_loc[0] + "px; \
      left:" + sketch_loc[1] + "px; \
      width:" + trial.sketch_size[0] + "px; \
      height:" + trial.sketch_size[1] + "px; \
      border: 2px solid #999; \
      display: none;'>";

    // make error messages
    display.innerHTML += '<div id="tooSlowContainer" \
      style="position: absolute; \
      width:' + paper_size + 'px; \
      height:' + paper_size + 'px; \
      background-color: #999;" \
      </div>';

    display.innerHTML += '<div id="tooSlowMessage" \
      style="position: relative; \
      top: 300px; \
      color: white; \
      margin: 20px"> \
      <p>Please try to respond as accurately and quickly as you can!</p> \
      <p>We will skip this trial since it looks like you have not responded within the last 10 seconds. \
      Click the button when you are ready to continue to the next trial.</p> \
      <button type="button" id="buttonSkip">Ready</button>\
      </div>';

    display.innerHTML += '<div id="cursorMessage" \
      style="position: absolute; \
      top: 250px; \
      left: 50px; \
      color: red; \
      display: none;"> \
      <p>Whoops! You need to <u>keep</u> your cursor on the crosshair until it disappears. \
      Please click it again.</p> \
      </div>';

    /////////////////////////////////////
    // set some global variables
    var turkInfo = jsPsych.turk.turkInfo();       
    var showSketchTimeStamp, clickTargetTimeStamp, clickTargetTimeStamp, rt;

    /////////////////////////////////////
    // show fixation upon windowload
    showFixation();

    let isMouseHover = false
    let crosshair = document.getElementById("crosshair");
    crosshair.addEventListener("mouseleave", function (event) {
      isMouseHover = false
      console.log(isMouseHover)
    }, false);
    crosshair.addEventListener("mouseover", function (event) {
      isMouseHover = true
      console.log(isMouseHover)
    }, false);

    function showFixation() {
      // timing params
      var delay_max = trial.target_delay_max,
        delay_min = trial.target_delay_min,
        // calculate random display delay upon windowload
        randTime = Math.floor(Math.random() * (delay_max - delay_min + 1)) + delay_min;

      // show sketch upon click
      $("#crosshair").click(function() {

        // show stimuli array after random delay time
        jsPsych.pluginAPI.setTimeout(function() {
          
          // check fields
          var exists = document.getElementsByClassName('field');
            // if fields don't exist AND if cursor is on crosshair, make 'em
            if ((exists.length == 0) && (isMouseHover == true)) {
              makeFields();
            } // otherwise, show error message
            else if ((exists.length == 0) && (isMouseHover == false)) {
              $('#cursorMessage').show();
            } // otherwise, prevent double firing of field making
            else if (exists.length == 6) {
              return
            };
        }, randTime); // close setTimeout function
      }); // close crosshair click function

      //hide tooslow message
      document.getElementById("tooSlowContainer").style.display = "none";
      document.getElementById("tooSlowContainer").style.zIndex = "-1";
      document.getElementById("tooSlowMessage").style.display = "none";
      document.getElementById("tooSlowMessage").style.zIndex = "-1";
    } // close showFixation function

    /////////////////////////////////////
    // generate fields
    function makeFields() {
      $('#cursorMessage').hide();
      $("#crosshair").hide();
      // drop opacity to zero to maintain same top dimension
      document.getElementById("fix_instructions").style.opacity = "0";
      document.getElementById("rt").style.opacity = "0";

      $("#myCanvas").show();
      showSketchTimeStamp = Date.now();

      // $('.field').remove();
      var container = $('#visual-search-circle-container');
      let fieldCount = trial.targets.length

      // randomly add stimulus to each field without repeat
      for (var i = 0; i < fieldCount; i++) {
        let randomIndex = Math.floor(Math.random() * trial.targets.length);
        $('<img />', {
          'class': 'field',
          'attribute': i,
          'src': trial.targets[randomIndex],
          'width': trial.targets_size[0] + "px",
          'height': trial.targets_size[1] + "px",
        }).appendTo(container);

        trial.targets.splice(randomIndex, 1);
      } // close for loop

      /////////////////////////////////////
      // distribute fields equidistant from fixation location and each other
      var fields = $('.field'),
        container = $('#visual-search-circle-container'),
        width = container.width(),
        height = container.height(),
        circle_max = 360,
        circle_min = 0,
        // calculate random angle upon windowload
        angle = Math.floor(Math.random() * (circle_max - circle_min + 1)) + circle_min,
        step = (2 * Math.PI) / fields.length;

      fields.each(function() {
        var x = Math.round(width / 2 + radius * Math.cos(angle) - $(this).width() / 2);
        var y = Math.round(height / 2 + radius * Math.sin(angle) - $(this).height() / 2);
        $(this).css({
          left: x + 'px',
          top: y + 'px'
        });
        angle += step;
      }); // close each field function
      addClicks();
    }; // close makeFields function

    /////////////////////////////////////
    // make timer
    var timerVar;

    function addClicks() {
      // if participant does not respond in 10s, display message and move onto next trial
        timerVar = setTimeout(function() {
          $('#tooSlowContainer').show();
          $('#tooSlowMessage').show();
          document.getElementById("tooSlowContainer").style.opacity = "0.95";
          document.getElementById("tooSlowContainer").style.zIndex = "1";
          document.getElementById("tooSlowMessage").style.zIndex = "2";
        }, 10000);

        $('#buttonSkip').click(function() {
          // get browser dims
          var windowWidth = window.innerWidth;
          var windowHeight = window.innerHeight;

          // define skipped data object to send to mongo  
          var identificationData = _.extend({}, trial, {
            dbname: trial.dbname,
            colname: trial.colname,
            iterationName: trial.iterationName,
            eventType: 'identification',
            condition: trial.condition,
            selectedTarget: 'skipped trial',
            wID: turkInfo.workerId, 
            hitID: turkInfo.hitId, 
            aID: turkInfo.assignmentId, 
            orig_gameID: trial.orig_gameID,
            timeSketchPresented: showSketchTimeStamp, 
            timeTargetClicked: 'skipped trial', 
            rt: 'skipped trial', 
            browser_height: windowHeight, 
            browser_width: windowWidth
          });

          console.log('currentData', identificationData);
          socket.emit('currentData', identificationData);

          // skip trial
          jsPsych.finishTrial();
        });

      // add ability to click and save data
      $('.field').click(function() {
        // hide tooslow message
        clearTimeout(timerVar);
        document.getElementById("tooSlowContainer").style.display = "none";
        document.getElementById("tooSlowContainer").style.zIndex = "-1";
        document.getElementById("tooSlowMessage").style.display = "none";
        document.getElementById("tooSlowMessage").style.zIndex = "-1";

        // increment trialNum
        trial.trialNum++;

        // record click time
        clickTargetTimeStamp = Date.now();

        // save clicked on target
        var src = $(this).attr('src');
        var toyType = src.split('/')[2].split('_')[0];
        var toyVar = src.split('/')[2].split('_')[1];
        var selectedObj = toyType + '_' + toyVar;
        console.log(selectedObj);

        // calculate rt
        var rt = clickTargetTimeStamp - showSketchTimeStamp;
        var feedback_display = document.getElementById('rt');
        document.getElementsByTagName('rt').innerHTML = rt;

        // display accuracy and rt after each trial
        if ((selectedObj == trial.toy_id) && (rt <= 5000)) {
          feedback_display.textContent = "Correct! Great speed, too " + "(" + rt/1000 + "s)";
          document.getElementById("rt").style.opacity = "1";
        } else if ((selectedObj == trial.toy_id) && (rt > 5000)){
          feedback_display.textContent = "Correct! But too slow " + "(" + rt/1000 + "s)";
          document.getElementById("rt").style.opacity = "1";
        } else if ((selectedObj != trial.toy_id) && (rt <= 5000)) {
          feedback_display.textContent = "Incorrect! But great speed " + "(" + rt/1000 + "s)";
          document.getElementById("rt").style.opacity = "1";
        } else if ((selectedObj != trial.toy_id) && (rt > 5000)) {
          feedback_display.textContent = "Incorrect! And too slow " + "(" + rt/1000 + "s)";
          document.getElementById("rt").style.opacity = "1";
        }

        // get browser dims
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        // define data object to send to mongo  
        var identificationData = _.extend({}, trial, {
          dbname: trial.dbname,
          colname: trial.colname,
          iterationName: trial.iterationName,
          eventType: 'identification',
          condition: trial.condition,
          selectedTarget: selectedObj,
          wID: turkInfo.workerId, 
          hitID: turkInfo.hitId, 
          aID: turkInfo.assignmentId, 
          orig_gameID: trial.orig_gameID,
          timeSketchPresented: showSketchTimeStamp, 
          timeTargetClicked: clickTargetTimeStamp, 
          rt: rt, 
          browser_height: windowHeight, 
          browser_width: windowWidth
        });

        console.log('currentData', identificationData);
        socket.emit('currentData', identificationData);

        $('.field').hide();
        $("#myCanvas").hide();
        
    /////////////////////////////////////
    // delay endTrial so participants can read rt feedback
        setTimeout(function() {
          jsPsych.finishTrial();
        }, 2000);
      }); // close field click function
    }; // close addClicks function
  }; // close plugin.trial

  return plugin;
})();