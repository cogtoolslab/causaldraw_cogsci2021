function sendData(data) {
  console.log('sending data to mturk');
  jsPsych.turk.submitToTurk({
    'score': 0 // placeholder
  });
}

// define trial object with boilerplate
function Trial() {
  // params for plugin
  this.type = 'jspsych-custom-visual-search',
    this.fixation_image = 'stim/crosshair.png',
    this.sketch_size = [225, 225],
    this.targets = ['stim/compressed/gears_1_circle_smaller.png',
      'stim/compressed/gears_2_circle_smaller.png',
      'stim/compressed/levers_1_circle_smaller.png',
      'stim/compressed/levers_2_circle_smaller.png',
      'stim/compressed/pulleys_1_circle_smaller.png',
      'stim/compressed/pulleys_2_circle_smaller.png'
    ],
    this.targets_size = [175, 175],
    this.circle_radius = 250,
    this.target_delay_max = 1250,
    this.target_delay_min = 750,
    // info for mongo
    this.dbname = 'causaldraw',
    this.colname = 'identification',
    this.iterationName = 'pilot2'
}; // close trial function

function setupGame() {
  socket.on('onConnected', function(d) {

    // get workerId, etc. from URL (so that it can be sent to the server)
    var turkInfo = jsPsych.turk.turkInfo();

    // make flags to control which trial types are included in the experiment
    const includeIntro = true;
    const includeFullScreen = true;
    const includeQuiz = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;
    const mTurk = false;

    // grab attributes of "d" that came back from server
    var metadata = d.meta;
    var gameid = d.gameid;
    if (mTurk) {
      var recruitmentPlatform = 'mturk'
    } else {
      var recruitmentPlatform = 'sona'
    };

    console.log(recruitmentPlatform);

    // console.log('meta', meta);

    /////////////////////////////////////
    // groupby blockNum
    // https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
    function groupBy(list, keyGetter) {
      const map = new Map();
      list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
      return map;
    }
    const grouped = groupBy(metadata, met => met.blockNum);

    // subset into separate blocks
    var b0 = grouped.get(0),
      b1 = grouped.get(1),
      b2 = grouped.get(2),
      b3 = grouped.get(3),
      b4 = grouped.get(4),
      b5 = grouped.get(5);

    // shuffle within blocks
    var blockNum0 = _.shuffle(b0),
      blockNum1 = _.shuffle(b1),
      blockNum2 = _.shuffle(b2),
      blockNum3 = _.shuffle(b3),
      blockNum4 = _.shuffle(b4),
      blockNum5 = _.shuffle(b5);

    // shuffle across blocks to randomly order them
    var metalist = [blockNum0, blockNum1, blockNum2, blockNum3, blockNum4, blockNum5];
    metashuff = _.shuffle(metalist);

    // combine into full meta
    var meta = metashuff[0].concat(metashuff[1], metashuff[2], metashuff[3], metashuff[4], metashuff[5]);

    /////////////////////////////////////
    // add plugin where user can click on image to make browser fullscreen
    var fullScreen_1 = {
      type: 'jspsych-full-screen-button',
      prompt: '<p>Click the laptop picture to make your browser window fullscreen. \
      Please stay in fullscreen mode.</p>'
    };

    var fullScreen_2 = {
      type: 'jspsych-full-screen-button',
      prompt: '<p>Please check that your browser window is fullscreen, and click the laptop picture. \
      Please stay in fullscreen mode until you finish the study.</p>'
    };

    // // var PID;

    // var collectPID = {
    //   timeline: [SONAtext],
    //   loop_function: function(data) {
    //     resp = JSON.parse(data.values()[0]['responses']);
    //     var PID = resp['Q0'];
    //     console.log('PID', PID);
    //   }
    // };

    /////////////////////////////////////
    // at end of each trial save data locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    // add additional default info so that experiment doesnt break without any stim uploaded
    var additionalInfo = {
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
      wID: turkInfo.workerId,
      hitID: turkInfo.hitId,
      aID: turkInfo.assignmentId,
      on_finish: main_on_finish
    }

    //collect PID info from SONA participants
    var PIDinfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var collectPID = _.extend({}, PIDinfo, {
      type: 'survey-text',
      questions: [{
        prompt: "Please enter your UCSD email address below. \
          This will only be used to verify that you completed this study, so that you can be given credit on SONA. \
          <i>Your UCSD email address will not be used for any other purpose.</i> \
          Click 'Continue' to participate in this study.",
        placeholder: "your UCSD email address",
        rows: 1,
        columns: 30,
        required: true
      }],
      on_finish: main_on_finish
    });

    /////////////////////////////////////
    // create practice trials
    var gears_1_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'gears_1',
      sketch_id: 'gears_1_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    var gears_2_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'gears_2',
      sketch_id: 'gears_2_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    var levers_1_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'levers_1',
      sketch_id: 'levers_1_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    var levers_2_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'levers_2',
      sketch_id: 'levers_2_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    var pulleys_1_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'pulleys_1',
      sketch_id: 'pulleys_1_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    var pulleys_2_practice = _.extend({}, new Trial, additionalInfo, {
      type: 'jspsych-custom-visual-search',
      toy_id: 'pulleys_2',
      sketch_id: 'pulleys_2_practice.png',
      blockNum: 'practice',
      condition: 'practice',
      phase: 'practice',
      numTrials: '6',
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
    });

    // count total trials
    var numTrials = meta.length;

    // generate trials for block1
    var trials_0 = _.map(metashuff[0], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i,
        numTrials: numTrials,
      })
    });

    // generate trials for block2
    var trials_1 = _.map(metashuff[1], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i + 50,
        numTrials: numTrials,
      })
    })

    // generate trials for block2
    var trials_2 = _.map(metashuff[2], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i + 100,
        numTrials: numTrials,
      })
    });

    // generate trials for block3
    var trials_3 = _.map(metashuff[3], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i + 150,
        numTrials: numTrials,
      })
    });

    // generate trials for block4
    var trials_4 = _.map(metashuff[4], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i + 200,
        numTrials: numTrials,
      })
    });

    // generate trials for block5
    var trials_5 = _.map(metashuff[5], function(trial, i) {
      return _.extend({}, trial, new Trial, additionalInfo, {
        trialNum: i + 250,
        numTrials: numTrials,
      })
    });

    /////////////////////////////////////
    // add instruction pages

    // edited string1 specific for mTurk study (e.g., payment)
    // 'str1': "<p>Welcome! In this study, you will play a \
    // fun game where you will see sketches and objects. Your task is to tell us which \
    // object the sketch represents. Your total time commitment is expected to be \
    // approximately 60 minutes, including the time it takes to read these instructions. \
    // For your participation in this study, you will be paid $X.XX.<p> \
    // <p>When you are finished, the study will be automatically submitted for approval. \
    // You can only perform this study one time.</p> <p><i>Note: We recommend using \
    // Chrome. This study has not been tested in other browsers.</i></p>",

    instructionsHTML = {
      'str1': "<p>Welcome! In this study, you will play a \
    fun game where you will see sketches and objects. Your task is to tell us which \
    object the sketch represents. Your total time commitment is expected to be \
    approximately 60 minutes, including the time it takes to read these instructions. \
    For your participation in this study, you will receive 1 credit through SONA.<p> \
    <p>When you are finished, the study will be automatically submitted for approval. \
    You can only perform this study one time.</p> <p><i>Note: We recommend using \
    Chrome. This study has not been tested in other browsers.</i></p>",
      'str2': "<p>At the beginning of each trial, you will see a crosshair at the middle \
    of your screen. After you click on it, it is important that you keep your cursor in \
    the same place until the trial advances.</p> \
    <div><img height='500' src='stim/intro_cross.png' id='intro_cross'></div>",
      'str3': "<p>Once you click on the crosshair, you will see a sketch appear at the center \
    of the screen surrounded by a circle of objects. Again, do not move your cursor \
    until the sketch and surrounding objects appear on your screen.<b> Once the array of objects \
    appear, your task is to click on the object that the sketch represents. Try to do this as \
    as <i>accurately</i> and as <i>quickly</i> as you can.</b></p> \
    <div><img height='500' src='stim/intro_circle.png' id='intro_circle'></div> \
    <p><br>You should try to click on an object in under 5 seconds. After you click an object, you'll \
    see whether you clicked the correct object or not. You'll also receive feedback on whether \
    you clicked on the object fast enough. After you see this feedback, you'll move onto the next \
    trial. Please try to do your best! You cannot change your answer after you click an object.</p> ",
      'str4': "<div class='center_instructions'><p>Here is what all the objects will look like.</p></div> \
    <div><img height='500' src='stim/compressed/toy_gallery_smaller.png' id='toy_gallery'></div>",
      'str5': "<p>To check that our interface works on your computer, let's practice first!</p> \
    <p>Next you'll complete 6 practice trials. Your task is to click the object that matches the image \
    at the center of the array. You should try to click on the matching object as accurately and as \
    quickly as you can. Below is an example of what you will see in your practice. Click 'Next' when \
    you're ready to complete the practice.</p> \
    <div><img height='500' src='stim/demo_circle.png' id='demo_circle'></div>",
      'str6': "<p>Great job on the practice! In the real test trials, you'll instead be presented with \
    sketches in the center of the array. Here's what one trial will look like. <b>Remember that you need \
    to click on the crosshair and <u>keep</u> your cursor on it until you see the sketch and surrounding \
    objects appear. Then you should try to click on the object that the sketch corresponds to as quickly \
    as you can.</b></p> \
    <video height='500' autoplay loop><source src='stim/intro_demo.mp4' type='video/mp4'> \
    <p>This study will have 300 trials, but you will have a chance to take a break after every 50 trials.<p>",
      'str7': "<p>That's it! When you're ready, click 'Next' to complete a short quiz.</p>",
      'str8': "<p>Well done! Click 'NEXT' when you're ready to begin the study.</p>"
    };

    // add random presentation of targets for view before test trials
    var gears_1 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                   <div><img height='500' src='stim/compressed/gears_1_smaller.png' id='gears_1'></div>",
      gears_2 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                  <div><img height='500' src='stim/compressed/gears_2_smaller.png' id='gears_2'></div>",
      levers_1 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                  <div><img height=500' src='stim/compressed/levers_1_smaller.png' id='levers_1'></div>",
      levers_2 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                  <div><img height='500' src='stim/compressed/levers_2_smaller.png' id='levers_2'></div>",
      pulleys_1 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                   <div><img height='500' src='stim/compressed/pulleys_1_smaller.png' id='pulleys_1'></div>",
      pulleys_2 = "<div class='center_instructions'><p>Please closely inspect this object so that you can recognize it easily during the study.</p></div> \
                   <div><img height='500' src='stim/compressed/pulleys_2_smaller.png' id='pulleys_2'></div>";

    var objFamiliarization = {
      type: 'instructions',
      pages: _.shuffle([gears_1, gears_2, levers_1, levers_2, pulleys_1, pulleys_2]),
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000
    };

    // add consent pages
    consentHTML = {
      'str1': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p id='legal'>By completing this study, you are participating in a \
      study being performed by cognitive scientists in the UC San Diego \
      Department of Psychology. The purpose of this research is to find out\
      how people understand visual information. \
      You must be at least 18 years old to participate. There are neither\
      specific benefits nor anticipated risks associated with participation\
      in this study. Your participation in this study is completely voluntary\
      and you can withdraw at any time by simply exiting the study. You may \
      decline to answer any or all of the following questions. Choosing not \
      to participate or withdrawing will result in no penalty. Your anonymity \
      is assured; the researchers who have requested your participation will \
      not receive any personal information about you, and any information you \
      provide will not be shared in association with any personally identifying \
      information.</p>"
      ].join(' '),
      'str2': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p> If you have questions about this research, please contact the \
      researchers by sending an email to \
      <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
      These researchers will do their best to communicate with you in a timely, \
      professional, and courteous manner. If you have questions regarding your \
      rights as a research subject, or if problems arise which you do not feel \
      you can discuss with the researchers, please contact the UC San Diego \
      Institutional Review Board.</p>"
      ].join(' ')
    };

    breaksHTML = {
      'str1': "<p>You've completed 50 of 300 trials! If you need to take a break, you can do so now. \
      Click the 'NEXT' button when you are ready to keep going.<p>",
      'str2': "<p>You've completed 100 of 300 trials! If you need to take a break, you can do so now. \
      Click the 'NEXT' button when you are ready to keep going.<p>",
      'str3': "<p>You've completed 150 of 300 trials! If you need to take a break, you can do so now. \
      Click the 'NEXT' button when you are ready to keep going.<p>",
      'str4': "<p>You've completed 200 of 300 trials! If you need to take a break, you can do so now. \
      Click the 'NEXT' button when you are ready to keep going.<p>",
      'str5': "<p>You've completed 250 of 300 trials! If you need to take a break, you can do so now. \
      Click the 'NEXT' button when you are ready to keep going.<p>"
    };

    /////////////////////////////////////
    // combine instructions and consent
    var introMsg_0 = {
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
    };

    var introMsg_X = {
      type: 'instructions',
      pages: [
        instructionsHTML.str2,
        instructionsHTML.str3,
        instructionsHTML.str4
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    };

    var introMsg_1 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str5
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    };

    var introMsg_2 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str6,
        instructionsHTML.str7
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    };

    var introMsg_3 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str8
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true,
      delayTime: 2000,
    };

    var break_0 = {
      type: 'instructions',
      pages: [
        breaksHTML.str1
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };

    var break_1 = {
      type: 'instructions',
      pages: [
        breaksHTML.str2
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };

    var break_2 = {
      type: 'instructions',
      pages: [
        breaksHTML.str3
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };

    var break_3 = {
      type: 'instructions',
      pages: [
        breaksHTML.str4
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };

    var break_4 = {
      type: 'instructions',
      pages: [
        breaksHTML.str5
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
    };

    /////////////////////////////////////
    // add comprehension check
    var quizTrial = {
      type: 'survey-multi-choice',
      preamble: "<b><u>Quiz</u></b><p>Before completing the next part of this study, please complete the following quiz.</p>",
      questions: [{
          prompt: "<b>Question 1</b> \
          <br>What should you do when you see the crosshair in the middle?",
          name: 'whatToDoCross',
          horizontal: false,
          options: ["Click on it, but you can move cursor away immediately",
            "Click on it, and keep your cursor on the crosshair until you see the presented images",
            "I don't know"
          ],
          required: true
        },
        {
          prompt: "<b>Question 2</b> \
          <br>True or False: Once you see a drawing appear, you should try to click on the correct image as quickly as possible.",
          name: 'whatToClick',
          horizontal: false,
          options: ["True",
            "False"
          ],
          required: true
        },
        {
          prompt: "<b>Question 2</b> \
          <br>Can you do this study more than once?",
          name: "howManyTimesHIT",
          horizontal: false,
          options: ["Yes",
            "No"
          ],
          required: true
        }
      ]
    };

    // Check whether comprehension check responses are correct
    var loopNode = {
      timeline: [quizTrial],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        if ((resp['whatToDoCross'] == 'Click on it, and keep your cursor on the crosshair until you see the presented images') &&
          (resp['whatToClick'] == 'True') &&
          (resp['howManyTimesHIT'] == 'No')) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };

    // add exit survey (multiple choice)
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo)); //new Trial,
    var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
      type: 'survey-multi-choice',
      preamble: "<strong><u>Survey</u></strong>",
      questions: [{
          prompt: "What is your sex?",
          name: "participantSex",
          horizontal: true,
          options: ["Male", "Female", "Neither/Other/Do Not Wish To Say"],
          required: true
        },
        {
          prompt: "How difficult did you find this study? (1: very easy, 7: very hard)",
          name: "judgedDifficulty",
          horizontal: true,
          options: ["1", "2", "3", "4", "5", "6", "7"],
          required: true
        },
        {
          prompt: "What device type did you use?",
          name: "deviceType",
          horizontal: true,
          options: ["Track Pad", "Mouse", "Other"],
          required: true
        },
        {
          prompt: "Did you encounter any technical difficulties while completing this study? \
            This could include: images were glitchy (e.g., did not load), ability to click \
            was glitchy, or sections of the study did \
            not load properly.",
          name: "technicalDifficultiesBinary",
          horizontal: true,
          options: ["Yes", "No"],
          required: true
        }
      ],
      on_finish: main_on_finish
    });

    // add exit survey (free response choice)
    var surveyTextInfo = _.omit(_.extend({}, new Trial, additionalInfo)); // new Trial,
    var exitSurveyText = _.extend({}, surveyTextInfo, {
      type: 'survey-text',
      preamble: "<strong><u>Survey</u></strong>",
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
          placeholder: "e.g., 2020",
          require: true
        },
        {
          name: 'participantComments',
          prompt: "Thank you for participating in our study! Do you have any other comments or feedback \
            to share with us about your experience?",
          placeholder: "I had a lot of fun!",
          rows: 5,
          columns: 50,
          require: false
        }
      ],
      on_finish: main_on_finish
    });

    // add goodbye page
    var goodbye = {
      type: 'instructions',
      pages: [
        'Congrats! You are all done. Thanks for participating in our game! \
        Click NEXT to submit this study.'
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false,
      on_finish: function() {
        sendData();
      }
    };

    /////////////////////////////////////
    // add all experiment elements to trials array
    var setup = [];

    // add set up before practice trials
    if (includeIntro) setup.push(introMsg_0);
    setup.push(collectPID);
    if (includeIntro) setup.push(introMsg_X);
    if (includeIntro) setup.push(objFamiliarization);
    if (includeIntro) setup.push(introMsg_1);
    if (includeFullScreen) setup.push(fullScreen_1);

    // create array of practice trials and shuffle
    var practice_list = [gears_1_practice, gears_2_practice,
      levers_1_practice, levers_2_practice,
      pulleys_1_practice, pulleys_2_practice
    ];
    practice_shuff = _.shuffle(practice_list);
    // make new array with shuffled practice
    var practice_trials = setup.concat(practice_shuff);

    if (includeIntro) practice_trials.push(introMsg_2);
    if (includeQuiz) practice_trials.push(loopNode);
    if (includeIntro) practice_trials.push(introMsg_3);
    if (includeFullScreen) practice_trials.push(fullScreen_2);

    // add all blocks of trials (with breaks)
    var experiment = practice_trials.concat(trials_0, break_0, trials_1, break_1, trials_2,
      break_2, trials_3, break_3, trials_4, break_4, trials_5);

    // add post experiment checks
    if (includeExitSurvey) experiment.push(exitSurveyChoice);
    if (includeExitSurvey) experiment.push(exitSurveyText);
    if (includeGoodbye) experiment.push(goodbye);

    console.log('experiment', experiment);

    // set up images for preload
    var imagePaths = ['stim/compressed/gears_1_circle_smaller.png',
      'stim/compressed/gears_2_circle_smaller.png',
      'stim/compressed/levers_1_circle_smaller.png',
      'stim/compressed/levers_2_circle_smaller.png',
      'stim/compressed/pulleys_1_circle_smaller.png',
      'stim/compressed/pulleys_2_circle_smaller.png',
      'stim/compressed/toy_gallery_smaller.png',
      'data/run1/gears_1_practice.png',
      'data/run1/gears_2_practice.png',
      'data/run1/levers_1_practice.png',
      'data/run1/levers_2_practice.png',
      'data/run1/pulleys_1_practice.png',
      'data/run1/pulleys_2_practice.png',
      'stim/intro_circle.png',
      'stim/intro_cross.png',
      'stim/demo_circle.png'
    ];

    // set up videos for preload
    var videoPaths = [
      'stim/intro_demo.mp4'
    ];

    jsPsych.init({
      timeline: experiment, //trials
      default_iti: 1000,
      preload_images: imagePaths,
      preload_video: videoPaths,
      show_progress_bar: true
    });

  }); // close onConnected
} // close setup game