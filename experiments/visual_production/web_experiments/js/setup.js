var shuffleTrials = true;

function sendData(data) {
  console.log('sending data to mturk');
  // if not bonusing, this is a dummy placeholder
  // meaning we don't send mturk anything we need
  // to analyze
  jsPsych.turk.submitToTurk({
    'score': 0
  });
}

// Define trial object with boilerplate
function Trial() {
  this.type = 'jspsych-cued-drawing';
  this.dbname = 'causaldraw';
  this.colname = 'machines';
  this.iterationName = 'run3'; //livetest0
  this.dev_mode = false; // Change this to TRUE if testing in dev mode (short trial videos) or FALSE for real experiment
  // this.inkLeft = 100; // Commenting this out for EXP1A
  // this.inkBudgetWidth = 100;
};

// Note: Number of trials to fetch from database is defined in ./app.js
function setupGame() {
  var socket = io.connect();

  socket.on('redirect', function(destination) {
    window.location.href = destination;
  });

  socket.on('onConnected', function(d) {

    // Get workerId, etc. from URL (so that it can be sent to the server)
    var turkInfo = jsPsych.turk.turkInfo();

    // get PROLIFIC participantID
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var prolificID = urlParams.get('PROLIFIC_PID')   // ID unique to the participant
    var studyID = urlParams.get('STUDY_ID')          // ID unique to the study
    var sessionID = urlParams.get('SESSION_ID')      // ID unique to the particular submission

    // Grab attributes of "d" that came back from server
    // (note: this is what we created in 'upload_stims_to_s3_and_mongo_drawbase.ipynb')
    var meta = d.meta;
    var gameid = d.gameid;
    var num_trials = meta.length;

    // Note: 'd' holds all trial info, including which selected version, which 6 trials, and gameID
    // console.log('d',d)

    // Note: 'meta' holds the 6 trials that were selected in 'd' (note: 'd.meta' is the same as 'meta')
    // console.log('meta', meta)

    // make flags to control which trial types are included in the experiment
    const includeIntro = true;
    const includeCollectUCSD = false;
    const includeQuiz = true;
    const includeExitSurvey = true;

    // recruitment platform
    const mTurk = false;

    // grab attributes of "d" that came back from server
    var meta = d.meta;
    var gameid = d.gameid;
    console.log('meta', meta);

    if (mTurk) {
      var recruitmentPlatform = 'mturk'
    } else {
      // IMPORTANT! Change to either SONA or PROLIFIC! 
      var recruitmentPlatform = 'prolific'
    };

    // at end of each trial save score locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    // Note: This is default info so that the experiment doesn't break without any stim uploaded!
    var additionalInfo = {
      // add prolific info
      prolificID:  prolificID,
      studyID: studyID, 
      sessionID: sessionID,
      // add usual info
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
      wID: turkInfo.workerId, 
      hitID: turkInfo.hitId, 
      aID: turkInfo.assignmentId, 
      on_finish: main_on_finish
    }

    // Generates rawTrialList, which shuffles d.trials
    var rawTrialList = shuffleTrials ? _.shuffle(d.meta) : d.meta;
    //      console.log('d.meta', d.meta);

    // Maps over rawTrialList, and add "additional info" to each trial objet
    // Then "flatten" it (see Lodash documentation for info)
    // Then "extend" it (note: this copies every property of the source objects into the first object)
    var trials = _.flatten(_.map(rawTrialList, function(trialData, i) {
      var trial = _.extend(new Trial, trialData, additionalInfo, {
        trialNum: i
      })
      return trial;
    }));

    // Add welcome page that includes CONSENT and INSTRUCTIONS pages
    instructionsHTML = {
      'str1': "<p>Welcome! In this study, you will play a fun game where you will draw some objects. \
      Your total time commitment is expected to be 20 minutes, including the time it takes to read these instructions. \
      For your participation in this study, you will receive $4.00 through Prolific.<p> \
      <p>When you are finished, the study will be automatically submitted for approval. \
      You can only perform this study one time.</p> \
      <p><i>Note: We recommend using Chrome. This study has not been tested in other browsers.</i></p>",
      // 'str1': "<p> Hello! In this HIT, you will play a drawing game.</p>\
      // <p>Your total time commitment is expected to be approximately 15 minutes, \
      // including the time it takes to read the instructions. \
      // For your participation in this study, you will be paid $3.00.</p>\
      // <p>When you are finished, the HIT will be automatically submitted for approval. \
      // You can only perform this HIT one time.</p> <p><i>Note: We recommend using Chrome. \
      // This HIT has not been tested in other browsers.</i></p>"
    }

    consentHTML = {
      'str1': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p id='legal'>By completing this study, you are participating in a study being performed \
        by cognitive scientists in the UC San Diego Department of Psychology. \
        The purpose of this research is to find out more about how people solve problems. \
        You must be at least 18 years old to participate. \
        There are neither specific benefits nor anticipated risks associated with participation in this study. \
        Your participation in this study is completely voluntary and you can withdraw at any time by simply exiting the study. \
        You may decline to answer any or all of the following questions. \
        Choosing not to participate or withdrawing will result in no penalty. \
        Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you \
        and any information you provide will not be shared in association with any personally identifying information.</p>"
      ].join(' '),
      'str2': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p> If you have questions about this research, please contact the researchers by sending an email to \
        <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
        These researchers will do their best to communicate with you in a timely, professional, and courteous manner. \
        If you have questions regarding your rights as a research subject, \
        or if problems arise which you do not feel you can discuss with the researchers, \
        please contact the UC San Diego Institutional Review Board.</p><p>Click NEXT to begin this study.</p>"
      ].join(' ')
    }

    secondInstructionsHTML = {
      'str1': "<p>In this game, you have discovered some mysterious artifacts while on a space expedition. \
      You hope to sell these artifacts to some aliens who you will visit along your expedition, \
      but need to send proof of your artifacts before they accept your sale.</p><img height ='400' src='stim/planet.png' id='planet'>",
      'str2': "<p>Your mission is to carefully document what you learn about each artifact by making drawings of them.</p>\
      <img height = '300' src='stim/pencildrawing.png' id='pencildrawing'><p>Your drawings do not have to be perfect, but please try your best!</p>",
      'str3': "<p>There are two kinds of aliens to whom you hope to sell your artifacts. Let's learn a bit about them.</p>\
      <p>This <coldep>blue</coldep> alien needs to know <coldep>what the artifacts look like.</coldep> \
      It collects unique looking artifacts from around the galaxy. \
      So you will need to <coldep>draw how your artifacts look different from other artifacts</coldep> that it may already own.</p>\
      <p><img height = '400' src='stim/alien_depict.png'></p>",
      'str4': "<p>This <colexp>red</colexp> alien needs to know <colexp>how the artifacts function.</colexp> \
      It builds gadgets and buys mechanical scraps from space explorers to learn about new mechanisms. \
      So you will need to <colexp>draw how your artifacts function so it can build gadgets that function in similiar ways.</colexp></p>\
      <p><img height = '400' src='stim/alien_explain.png'</p>",
      'str5': "<p>Before you see your mysterious artifacts, let's practice drawing some familiar objects. Click NEXT to practice!</p>",
      'str6': "<p>Here are some objects:<div><img height = '500' src='stim/tongs_gallery.png' id='tongs_gallery'></div>\
      Click NEXT to see a video of one of these objects and to make a practice drawing.</p>"
    }

    thirdInstructionsHTML = {
      'str1': "<p>Great! Remember that the aliens want drawings of:</p><p><div><img height = '450' src='stim/aliens_subtitles.png'></div></p>",
      'str2': "<p>Okay, now that you have practice, let's learn about the mysterious artifacts that you've discovered.",
      'str3': "<p>On every artifact, there are 2 red components that are connected to 2 wires. \
      When these components are connected, you learn that this light bulb turns on.</p> \
      <video autoplay loop height='500'><source src='stim/fam_light.mp4' id='famVid'></video><p>Click NEXT to see your artifacts!</strong></p>",
      'str4': "<p>Here are the mysterious artifacts that you've discovered!\
      <div>\<img height = '500' src='stim/toy_gallery.png' id='gallery'></div>\
      Notice how all the artifacts have 2 red components and 2 wires connected to a light bulb? \
      <strong>Because each artifact has these features, you SHOULD NOT draw these in your drawings.</strong> \
      Your drawings only need to include what is important for each alien. \
      <strong>Also, you SHOULD NOT write words in your drawings.</strong></p>\
      <p>Click NEXT to inspect each artifact!</p>"
    }

    var gears1 = "<div><img height = '500' src='stim/gears1.png' id='gears1'></div>"
    var gears2 = "<div><img height = '500' src='stim/gears2.png' id='gears2'></div>"
    var levers1 = "<div><img height = 500' src='stim/levers1.png' id='levers1'></div>"
    var levers2 = "<div><img height = '500' src='stim/levers2.png' id='levers2'></div>"
    var pulleys1 = "<div><img height = '500' src='stim/pulleys1.png' id='pulleys1'></div>"
    var pulleys2 = "<div><img height = '500' src='stim/pulleys2.png' id='pulleys2'></div>"

    var objFamiliarization = {
      type: 'instructions',
      pages: _.shuffle([gears1, gears2, levers1, levers2, pulleys1, pulleys2]),
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000
    }

    fourthInstructionsHTML = {
      'str1': "<p>Here's a summary of your mission in this game:</p>\
      <p>For the <coldep>blue</coldep> alien, you will make drawings to <coldep>show what the artifacts <i>look like</i>.</coldep> \
      This alien wants drawings that will <coldep>show it that your artifacts are entirely unique looking in the galaxy.</coldep> \
      It wants to add to its collection of space artifacts.</p>\
      <p>For the <colexp>red</colexp> alien, you will make drawings to <colexp>show how the artifacts <i>function</i>.</colexp>\
      This alien wants drawings that will <colexp>show it how your artifacts can be used to turn the light on.</colexp> \
      It wants to learn about new mechanisms to build its own gadgets that work in similar ways.</p>\
      <p><strong>But remember that you SHOULD NOT draw the light, wires, or two red components because each artifact has these same features.</strong> \
      You only need to draw what is important for each alien. <strong>Also, you SHOULD NOT write words in your drawings.</strong>\
      <p><div><img height = '450' src='stim/aliens_subtitles.png'></div></p>",
      'str2': "<p>Let's check that you know all the rules of this drawing game! Click NEXT to complete a short quiz.</p>"
    }

    fifthInstructionsHTML = {
      'str1': '<p> Well done! Now you are ready to start drawing your artifacts. Click NEXT to start.</p> \
      <p> If you encounter technical difficulties during the study that prevent you from completing the experiment, \
      please email the researcher (<b><a href="mailto://cogtoolslab.requester@gmail.com">cogtoolslab.requester@gmail.com</a></b>) to arrange for prorated compensation.</p>'
    }

    // Set order of CONSENT and INSTRUCTIONS pages but split into 2 welcomes to insert practice trials
    var welcome = {
      type: 'instructions',
      pages: [
        instructionsHTML.str1,
        consentHTML.str1,
        consentHTML.str2,
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    }

    var welcome_2 = {
      type: 'instructions',
      pages: [
        secondInstructionsHTML.str1,
        secondInstructionsHTML.str2,
        secondInstructionsHTML.str3,
        secondInstructionsHTML.str4,
        secondInstructionsHTML.str5,
        secondInstructionsHTML.str6
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    }

    var previewTrial = {
      type: 'instructions',
      pages: [instructionsHTML.str1],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: false,
      delay: true,
      delayTime: 120000
    }

    // Set second order of last instructions before test trials
    var secondwelcome = {
      type: 'instructions',
      pages: [
        thirdInstructionsHTML.str1,
        thirdInstructionsHTML.str2,
        thirdInstructionsHTML.str3,
        thirdInstructionsHTML.str4
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    }

    var thirdwelcome = {
      type: 'instructions',
      pages: [
        fourthInstructionsHTML.str1,
        fourthInstructionsHTML.str2
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    }

    var fourthwelcome = {
      type: 'instructions',
      pages: [
        fifthInstructionsHTML.str1
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    }

    //collect PID info from SONA participants
    var UCSD_info = _.omit(_.extend({}, new Trial, additionalInfo));
    var collectUCSD_info = _.extend({}, UCSD_info, {
      type: 'survey-text',
      questions: [{
          prompt: "<p>Please enter your email address below. <i>Note that it is important that you use the email \
          address that you use to sign up for SONA studies.</i> For some students, this is their UCSD email address. \
          <p>This will only be used to verify that you completed this study, so that you can be given credit on SONA. \
          Your email address will not be used for any other purpose. \
          Otherwise, it is difficult to assign credit because students are only identified by their email address, \
          first name, and last name.</p> \
          <p>Click 'Continue' to participate in this study.</p>",
          placeholder: "your email address",
          rows: 1,
          columns: 30,
          required: true
        }
      ],
      on_finish: main_on_finish
    });

    // Add practice trials
    var practice1 = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-cued-drawing',
      stim_url: '../stim/tongs.mp4',
      toy_type: 'practice',
      toy_variant: 'practice',
      condition: 'explanatory',
      demo_seq: 'practice',
      version: 'practice',
      file_id: 'tongs',
      demo_dur: 28,
      phase: 'practice'
    });

    var practice2 = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-cued-drawing',
      stim_url: '../stim/tongs.mp4',
      toy_type: 'practice',
      toy_variant: 'practice',
      condition: 'depictive',
      demo_seq: 'practice',
      version: 'practice',
      file_id: 'tongs',
      demo_dur: 28,
      phase: 'practice'
    });

    // Add goodbye page (last page)
    var goodbye = {
      type: 'instructions',
      pages: [
        "<p>Congrats! You are all done. Thanks for participating in our game! \
        Please click 'Next' to submit your data to Prolific!</p>"
      ],
      // pages: [
      //   "<p>Congrats! You are all done. Thanks for participating in our game!</p> \
      //   <p>Click 'NEXT' to submit this study to SONA. After you click 'Next', you will see a blank page on this web page \
      //   but will be redirected to the SONA homepage. \
      //   This means that your participation has been logged. \
      //   If you do not receive credit after immediately, please wait a few days. If you do not receive credit after 3 days, please email \
      //   <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b></p>"
      // ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
      on_finish: function() {
        sendData();
      window.open("https://app.prolific.co/submissions/complete?cc=21F887EF","_self")
      // window.open('https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=1957&credit_token=94edbf1cbf524148b93e396bc6194eae&survey_code=' + jsPsych.data.getURLVariable('survey_code'))
      }
    }

    // Add comprehension check
    var quizTrial = {
      type: 'survey-multi-choice',
      preamble: "<strong><u>Quiz</u></strong>",
      questions: [{
          prompt: "True or False: You SHOULD <i>ALWAYS</i> include the light bulb, wires, and two red components in your drawing.",
          name: 'whatToDraw',
          options: ["True ", "False "],
          required: true
        },
        {
          prompt: "True or False: You SHOULD NOT write words in your drawing.",
          name: 'whatToWrite',
          options: ["True ", "False "],
          required: true
        },
        {
          prompt: "What should your drawings depict for the <colexp>red</colexp> alien?",
          name: "redAlienWhatKindToDraw",
          options: ["Where the artifacts were discovered ", "What parts of the artifact are more expensive  ", "How the artifacts function "],
          required: true
        },
        {
          prompt: "What should your drawings depict for the <coldep>blue</coldep> alien?",
          name: "blueAlienWhatKindToDraw",
          options: ["How old you predict the artifacts to be ", "What the artifacts look like ", "Where the aliens should meet you for the sale "],
          required: true
        },
        {
          prompt: "Can you do this study more than once?",
          name: "howManyTimesHIT",
          options: ["Yes ", "No "],
          required: true
        }
      ]
    };

    // Check whether comprehension check responses are correct
    var loopNode = {
      timeline: [quizTrial],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        // console.log('data.values',resp);
        if ((resp['whatToDraw'] == 'False ') 
        && (resp['whatToWrite'] == 'True ') 
        && (resp['redAlienWhatKindToDraw'] == 'How the artifacts function ') 
        && (resp['blueAlienWhatKindToDraw'] == 'What the artifacts look like ') 
        && (resp['howManyTimesHIT'] == 'No ')) 
        {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    }

    // exit survey trials
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial), ['type', 'dev_mode']);
    var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
      type: 'survey-multi-choice',
      preamble: "<strong><u>Exit Survey</u></strong>",
      questions: [{
          prompt: "What is your sex?",
          name: "participantSex",
          horizontal: false,
          options: ["Male", "Female", "Neither/Other/Do Not Wish To Say"],
          required: true
        },
        {
          prompt: "Which of the following did you use to make your drawings?",
          name: "inputDevice",
          horizontal: false,
          options: ["Mouse", "Trackpad", "Touch Screen", "Stylus", "Other"],
          required: true
        },
        {
          prompt: "How difficult did you find this experiment? (1: very easy, 7: very hard)",
          name: "judgedDifficulty",
          horizontal: false,
          options: ["1", "2", "3", "4", "5", "6", "7"],
          required: true
        },
        {
          prompt: "Did you encounter any technical difficulties while completing this study? \
          This could include: videos were glitchy (e.g., did not load, froze, or appeared to stop too soon), drawing interface was glitchy \
          (e.g., cursor did not draw), or sections of the study did not load properly.",
          name: "technicalDifficultiesBinary",
          horizontal: false,
          options: ["Yes", "No"],
          required: true
        }
      ],
      on_finish: main_on_finish
    });

    // Add survey page after trials are done
    var surveyTextInfo = _.omit(_.extend({}, new Trial), ['type', 'dev_mode']);
    var exitSurveyText = _.extend({}, surveyTextInfo, {
      type: 'survey-text',
      preamble: "<strong><u>Exit Survey</u></strong>",
      questions: [{
          name: "TechnicalDifficultiesFreeResp",
          prompt: "If you encountered any technical difficulties, please briefly describe the issue.",
          placeholder: "I did not encounter any technical difficulities.",
          rows: 5,
          columns: 50,
          required: false
        },
        {
          name: 'participantAge',
          prompt: "What is your year of birth?",
          placeholder: "XXXX",
          require: true
        },
        {
          name: 'participantComments',
          prompt: "Thank you for participating in our study! Do you have any other comments or feedback to share with us about your experience?",
          placeholder: "I had a lot of fun!",
          rows: 5,
          columns: 50,
          require: false
        }
      ],
      on_finish: main_on_finish
    });

    // Add all pages to trial list (unshift = add to beginning, push = add to end)
    if (includeIntro) trials.unshift(fourthwelcome);
    if (includeQuiz) trials.unshift(loopNode);
    if (includeIntro) trials.unshift(thirdwelcome);
    if (includeIntro) trials.unshift(objFamiliarization);
    if (includeIntro) trials.unshift(secondwelcome);
    trials = _.flatten(_.shuffle([practice1, practice2])).concat(trials); // prepend shuffled practice trials

    // Stick welcome trial if not previewMode, otherwise insert previewMode
    if (!turkInfo.previewMode) {
      trials.unshift(welcome_2);
      if (includeCollectUCSD) trials.unshift(collectUCSD_info);
      trials.unshift(welcome);
    } else {
      trials.unshift(previewTrial);
    }

    if (includeExitSurvey) trials.push(exitSurveyChoice);
    if (includeExitSurvey) trials.push(exitSurveyText);
    trials.push(goodbye);

    // print out complete trial list
    console.log('all trials:', trials);

    // construct list of assets we need to preload
    var drawingTrials = _.filter(trials, {
      'type': 'jspsych-cued-drawing'
    });

    var videoPaths = _.map(drawingTrials, function(n, i) {
      return n['stim_url']
    });

    videoPaths.push('stim/fam_light.mp4');
    // console.log(videoPaths);
    var imagePaths = [
      'stim/gears1.png', 
      'stim/gears2.png', 
      'stim/levers1.png', 
      'stim/levers2.png', 
      'stim/pulleys1.png', 
      'stim/pulleys2.png', 
      'stim/toy_gallery.png'];

    // Timeline of trials
    jsPsych.init({
      timeline: trials,
      default_iti: 1000,
      preload_video: videoPaths,
      preload_images: imagePaths,
      show_progress_bar: true
    });
  });
}