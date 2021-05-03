jsPsych.plugins['jspsych-stroke-annotations'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-stroke-annotations',
    parameters: {
      rois: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'ROI metadata for this machine',
        default: undefined,
        description: 'annotated machine with regions of interest'
      },
      strokes: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'sequence of strokes for this sketch',
        default: undefined,
        description: 'SVG representation of sketch to be annotated'
      }
    } //close parameters
  } // close plugin.info

  plugin.trial = function(display_element, trial) {

    // data for single trial already loaded
    // see this line in index.html:
    // <script type="text/javascript" src="data/example.json"></script>

    // extract trial level metadata
    trial.stim_url = _.uniq(_.map(trial.strokes, 'stim_url'))[0];
    trial.toy_type = _.uniq(_.map(trial.strokes, 'toy_type'))[0];
    trial.toy_id = _.uniq(_.map(trial.strokes, 'toy_id'))[0];
    trial.ref_url = _.uniq(_.map(trial.rois, 'ref_url'))[0];    
    trial.raw_ref_url = 'stim/' + _.uniq(_.map(trial.rois, 'raw_ref_url'))[0];    
    trial.roi_ids = trial.rois.map(el => el.roi_id);
    trial.roi_colors = trial.rois.map(el => el.roi_color);
    trial.num_rois = trial.roi_ids.length;
    trial.sketchID = _.uniq(_.map(trial.strokes, 'sketch_id'))[0]
    trial.condition = _.uniq(_.map(trial.strokes, 'condition'))[0];
    trial.orig_gameID = _.uniq(_.map(trial.strokes, 'orig_gameID'))[0]
    trial.orig_trialNum = _.uniq(_.map(trial.strokes, 'orig_trialNum'))[0]
    trial.orig_version = _.uniq(_.map(trial.strokes, 'orig_version'))[0]
    trial.batch_id_across_machines = _.uniq(_.map(trial.strokes, 'batch_id_across_machines'))[0]
    trial.batch_id_within_machine = _.uniq(_.map(trial.strokes, 'batch_id_within_machine'))[0]
    trial.svg = _.uniq(_.map(trial.strokes, 'svg'))[0]

    // extract trial data
    trial.svgArray = _.map(trial.strokes, 'svg');

    /////////////////////////////////////
    // build html for stimuli display
    var html = '';

    // add container for text and columns
    html += '<div id="container">'

    // add trial counter
    html += '<div id="trialNum"> ' + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';

    // add row 1 for instructions
    html += '<div class="row">'
    html += '<div id="segmentInstructions" class="instructions">'
    html += '<p>Please label the part of the drawing that the highlighted stroke represents.</p>'
    html += '</div>'

    html += '<div id="symbolInstructions" class="instructions">'
    html += '<p>Please label the part(s) of the drawing that the symbol corresponds to.</p>'
    html += '</div>'
    html += '</div>' // close row

    // add row 2 for for columns
    html += '<div class="row">'

    // add column 3 for reference image
    html += '<div class="col">'
    html += '<div class="cueCanvasWrapper">'
    html += '<img id="ref" src=" ' + trial.ref_url + '">';
    html += '</div>' // close cueCanvasWrapper
    html += '</div>' // close col

    // add column 1 for buttonGallery: segmentation buttons
    // see map function after all html is inserted for how we add the ROI buttons
    html += '<div class="col">'
    html += '<div id="buttonGallery">'
    html += '<strong>Labels</strong>'

    // add an "symbols" button
    html += '<div id="symbols" class="buttons_sym">'
    html += '<p>symbol</p>'
    html += '</div>'

    // add an "i dunno" button
    html += '<div id="unintelligible" class="buttons">'
    html += "<p>I can't tell</p>"
    html += '</div>' // close last button div
    html += '</div>' // close buttonGallery
    html += '</div>' // close col

    //// add duplicate gallery for clicking on elements that relate to a symbol
    // add column 1 for symWhiteOut: symbol buttons
    // html += '<div class="col">'
    html += '<div id="symWhiteOut">'
    html += '<strong>Labels</strong>'

    html += '<button id="done" type="button" class="jspsych-btn">Done</button>'
    html += '</div>' // close buttonGallery
    html += '</div>' // close col

    // add column 2 for sketch canvas
    html += '<div class="col">'

    // add canvas to display sketch
    html += '<canvas id="myCanvas" resize="false"></canvas>'
    html += '</div>' // close col
    html += '</div>' // close entire row of columns

    html += '<div class="row">'
    html += '<div id="error">'
    html += '<p>Please label the item(s) that the symbol refers to!</p>'
    html += '</div>'
    html += '</div>'
    html += '</div>' //close container of text and columns

    /////////////////////////////////////
    // now assign html to display_element.innerHTML and show content container
    display_element.innerHTML = html;

    // record trial start timestamp
    showSketchTimestamp = Date.now();

    // show entire experiment display (including ref image, button menu, and sketch canvas)
    $("#container").fadeIn(500);

    /////////////////////////////////////
    // set up paper canvas
    var myCanvas = new paper.PaperScope();
    myCanvas.setup('myCanvas');

    // convert svg string to paper.js path objects
    var self = this;
    var pathArray = _.map(trial.svgArray, s => new Path(s.toString())); // note that this works because we reset the index
    // console.log(pathArray);

    // set properties for each stroke
    _.forEach(pathArray, function(path, i) {
      path.strokeColor = 'rgb(0,0,0)';
      path.strokeWidth = 5;
      path.strokeNum = i;
      currIndex = 0;
    })

    trial.strokeIndex = pathArray[currIndex].index;
    // trial.arcLength = pathArray[currIndex].length;

    console.log('trial', trial);
    
    /////////////////////////////////////
    var turkInfo = jsPsych.turk.turkInfo();       

    //set global variables for timing
    var strokeShownTimestamp, symbolSubmittedTimestamp;

    // copy all trial info into new variable
    // make sure that all needed data has been extracted from trial! 
    var reducedtrial = {...trial};
    // remove redundant `strokes` and `svgArray` to reduce size 
    // (otherwise, we get "PayloadTooLargeError: request entity too large")
    delete reducedtrial.strokes;
    delete reducedtrial.svgArray;

    // define data object to send to mongo  
    strokeData = _.extend({}, reducedtrial, {
      dbname: trial.dbname,
      colname: trial.colname,
      iterationName: trial.iterationName,
      sketchID: trial.sketchID,
      eventType: 'labels',
      condition: trial.condition,
      wID: turkInfo.workerId, 
      hitID: turkInfo.hitId, 
      aID: turkInfo.assignmentId, 
      orig_gameID: trial.orig_gameID, 
      orig_trialNum: trial.orig_trialNum, 
      orig_version: trial.orig_version,
      timeSketchPresented: showSketchTimestamp
    });

    // if 'catch' is already set to true because it is a catchTrial, then keep 'catch' as true
    if (strokeData.catch == true) {
      strokeData
    } 
    // otherwise, if not a catchTrial, set 'catch' to false
    else {
      strokeData = _.extend({}, strokeData, {
        catch: false,
      });
    };

    // console.log('check', strokeData.catch);

      // add as many buttons as there are ROIs
      let $buttonGallery = $("#buttonGallery");
      let myList = trial.roi_ids;
      let myColors = trial.roi_colors;

      // make as many buttons as there are roi's
      myList.map(function(roi, index) {   
        // formatting for pretty names
        let rename = roi.split("_", 2);
        let rename_first = (rename[0]);
        let rename_last = (rename[rename.length - 1]);
        let edited_roi = (rename_last + ' ' + rename_first);     

        // upon cursor hover over, change color to specific roi color 
          let $button = $("<div></div>")
            .addClass("buttons")
            .attr("id", "button_" + edited_roi)
            .html("<p>" + edited_roi + "</p>")
            .on("mouseenter", function() {
              $(this).css("background", myColors[index]);
            })
            .on("mouseleave", function() {
              if (!$(this).hasClass('selected')) {
                $(this).css("background", "transparent");
              }
            })
            .on("click", function() {
              $(this).css("background", myColors[index]);
              $(this).toggleClass('selected');
              
              // print selected button to console
              console.log();
              elementSubmittedTimestamp = Date.now();

              // add selected button to stokeData
              strokeData = _.extend({}, strokeData, {
                strokeIndex: pathArray[currIndex].index,
                arcLength: pathArray[currIndex].length,
                roi_labelNum: edited_roi.split(" ")[0], 
                roi_labelName: edited_roi.split(" ")[1], 
                roi_symLabelID: 'nonsymbol',  
                timeStrokeSubmitted: elementSubmittedTimestamp,
                timeResponseLatency: elementSubmittedTimestamp - strokeShownTimestamp
              });
            // send data to server
            console.log('currentData',strokeData);
            socket.emit('currentData',strokeData);
            })
          $("#symbols").before($button); 
        });

    // same for symbol button menu
    let $symWhiteOut = $("#symWhiteOut");
    
    // make as many symbol buttons
    let clicked = [];

    myList.map(function(roi, index) { 
      // formatting for pretty names
      let rename = roi.split("_", 2);
      let rename_first = (rename[0]);
      let rename_last = (rename[rename.length - 1]);
      let symEdited_roi = (rename_last + ' ' + rename_first);  

      // upon cursor hover over, change color to specific roi color 
        let $symButtons = $("<div></div>")
          .addClass("symButtons")
          .attr("symId", "symButton_" + symEdited_roi)
          .html("<p>" + symEdited_roi + "</p>")
          .on("mouseenter", function() {
            $(this).css("background", myColors[index]);
          })
          .on("mouseleave", function() {
            if (!$(this).hasClass('symSelected')) {
              $(this).css("background", "transparent");
            }
          })
          .on("click", function() {
            $(this).css("background", myColors[index]);
            $(this).toggleClass('symSelected');

          // push clicked variables to array
          // note that this array contains only the selected buttons
          // i.e., the user can unselect buttons and this will also upadte the array
          clicked = [];
          let syms = document.querySelectorAll('.symSelected');
	        console.log('syms',syms);
          for (let n = 0; n < syms.length; n++) {
            if (!clicked.includes(syms[n].textContent)) {
              clicked.push(syms[n].textContent);
            }
          };
        console.log('clicked',clicked);
        symbolSubmittedTimestamp = Date.now();

          // add array to strokeData
          strokeData = _.extend({}, strokeData, {
            strokeIndex: pathArray[currIndex].index,
            arcLength: pathArray[currIndex].length,
            roi_labelName: 'symbols',
            roi_labelNum: 'NA',  
            roi_symLabelID: clicked,  
            timeStrokeSubmitted: symbolSubmittedTimestamp,
            timeResponseLatency: symbolSubmittedTimestamp - strokeShownTimestamp
          });

          // note to self: we emit data when the user clicks the done button
          // that way only the final selected array is submitted (not every click)
          });

          $("#done").before($symButtons); 
      });

    // upon clicking a 'symbol' label, allow user to select multiple buttons until click 'done'
    $("#symbols").click(function(){
      $("#symbols").toggleClass("selected");
      nextSymLabel();
    });

    $("#unintelligible").click(function(){
      $(this).toggleClass("selected");
      unintelligibleSubmittedTimestamp = Date.now();

      strokeData = _.extend({}, strokeData, {
        strokeIndex: pathArray[currIndex].index,
        arcLength: pathArray[currIndex].length,
        roi_labelName: 'unintelligible',  
        roi_labelNum: 'NA', 
        roi_symLabelID: 'nonsymbol',  
        timeStrokeSubmitted: unintelligibleSubmittedTimestamp,
        timeResponseLatency: unintelligibleSubmittedTimestamp - strokeShownTimestamp
      });
      // send data to server
      console.log('currentData',strokeData);
      socket.emit('currentData',strokeData);
    });

    // check length of first stroke  
    console.log('check first svg stroke', pathArray[currIndex].length);

    // if first stroke is less than 5px, then skip
    // note to self (7/21/20): we decided to drop this to 0px and will expect people will select "I can't tell"
    var limit = 0;
    strokeShownTimestamp = Date.now();

    if (pathArray[0].length <= limit) {
      strokeData = _.extend({}, strokeData, {
        strokeIndex: pathArray[currIndex].index,
      });
      console.log('skipping first stroke');
      // currIndex++;
      // trial.trialNum++;
      strokeData = _.extend({}, strokeData, {
        strokeIndex: pathArray[currIndex].index,
        arcLength: pathArray[currIndex].length,
        roi_labelName: 'short', 
        roi_labelNum: 'NA',
        roi_symLabelID: 'short',
        timeGreenStrokePresented: showSketchTimestamp, 
        timeResponseLatency: 0
      });
      // send data to server
      console.log('currentData',strokeData);
      socket.emit('currentData',strokeData);
      nextStroke()
    } 
    // otherwise set first stroke to green
    else if (pathArray[0].length > limit){
      pathArray[0].strokeColor = 'rgb(0,250,0)';
      strokeData = _.extend({}, strokeData, {
        timeGreenStrokePresented: showSketchTimestamp,
      });
    }

    function nextSymLabel() {
      $("#symWhiteOut").fadeIn(500);
      $("#buttonGallery").fadeOut(10);
      $("#symbolInstructions").show();
      $("#segmentInstructions").hide();
      $("#done").show();

      $("#done").on("click", doneSym);
    }; // end nextSymLabel

    function doneSym() {
      $("#symWhiteOut").fadeOut(500);
      $("#buttonGallery").fadeIn(500);
      $("#symbolInstructions").hide();
      $("#segmentInstructions").show();
      $("#done").hide();

      // check that user has labeled what the symbol refers to
      if (clicked.length > 0) {
        $('#error').hide()

        // send data to server
        // only send final selection of clicked array (so that user can unclick buttons
        // if they change their mind as they annotate symbols)
        console.log('currentData',strokeData);
        socket.emit('currentData',strokeData);

        // when done labelling element that symbol corresponds to, move onto next stroke
        nextStroke();
          
      } else {
        $('#error').show()
      };

      // reset clicked list
      clicked = [];

      $(".symButtons").css("background", "transparent");
      $("#done").off("click");

      }; // end doneSym

    // upon clicking a label, highlight next stroke in green
    $(".buttons").on("click", nextStroke);
    $(".buttons").removeClass("selected")
    $(".symButtons").removeClass("symSelected")
    $(".symUnintelligible").removeClass("clicked")

    function nextStroke() {
      strokeShownTimestamp = Date.now();

      strokeData = _.extend({}, strokeData, {
        timeGreenStrokePresented: strokeShownTimestamp,
      });

      var currentPath = pathArray[currIndex];
      console.log('check current svg stroke', pathArray[currIndex].length);

      if (currIndex == (pathArray.length - 1)) {
        endTrial();
      } else {
        //set previous stroke to black
        currentPath.strokeWidth = 5;
        currentPath.strokeColor = "rgb(0, 0, 0)";
        currIndex++;
        trial.trialNum++;

        // if it is the 2nd stroke and not out of the bound, set current stroke to green
        if (pathArray[currIndex].length > limit && currIndex != 0 && currIndex < pathArray.length) {
          pathArray[currIndex].strokeColor = "rgb(0, 250, 0)";

        } else if (pathArray[currIndex].length <= limit && currIndex != 0 && currIndex < pathArray.length) {
          console.log('too short, skipping!');
            strokeData = _.extend({}, strokeData, {
              strokeIndex: pathArray[currIndex].index,
              arcLength: pathArray[currIndex].length,
              roi_labelName: 'short', 
              roi_labelNum: 'NA',
              roi_symLabelID: 'short'
            });
            // currIndex++;
            // trial.trialNum++;
            // send data to server
            console.log('currentData',strokeData);
            socket.emit('currentData',strokeData);
            nextStroke();
          } //close else if statement
        } // close else statements

      $(".buttons").removeClass("selected");
      $(".symButtons").removeClass("symSelected");
      $(".symUnintelligible").removeClass("clicked");

    // note to self: rather than emit to the serverat the end of each stroke, 
    // we decided to go with a more fine-grained approach and emit upon each button click

    // console.log('currentData',strokeData);
    // socket.emit('currentData',strokeData);

  }; // close nextStroke function

    function endTrial() {
      display_element.innerHTML = "<p>Fetching another sketch for you!";
      jsPsych.finishTrial(); // move on to the next trial
    };

  }; // close plugin.trial

  return plugin;
})();
