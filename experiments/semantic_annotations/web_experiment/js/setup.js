function sendData(data) {
  console.log('sending data to mturk');
  jsPsych.turk.submitToTurk({
    'score': 0   //this is a dummy placeholder
  });
}

// Define trial object with boilerplate
function Trial() {
	this.type = 'jspsych-stroke-annotations',
  this.dbname = 'causaldraw';
  this.colname = 'annotations'; 
  this.iterationName = 'debugging'; 
};

function setupGame() {
  socket.on('onConnected', function(d) {
    // Get workerId, etc. from URL (so that it can be sent to the server)
      var turkInfo = jsPsych.turk.turkInfo();

    // These are flags to control which trial types are included in the experiment
    const includeIntro = true;
    const includeDemo = true;
    const includeQuiz = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;

    // Grab attributes of "d" that came back from server 
    // (note: this is what we created in 'upload_stims_to_s3_and_mongo_drawbase.ipynb')
    var meta = d.meta;
    var gameid = d.gameid;
    var version = d.experimentVersion;

    // console.log('meta', meta);

    // at end of each trial save data locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    // add additional default info so that experiment doesnt break without any stim uploaded
    var additionalInfo = {
      gameID: gameid,
      on_finish: main_on_finish
    }

    // Add catch trial depending on the toy_id of the selected trials array
    // console.log('toy_id', trials[0].strokes[0].toy_id);
    catchTrials = {
    'gears_1': gears1catch, 
    'gears_2': gears2catch,
    'levers_1': levers1catch, 
    'levers_2': levers2catch,
    'pulleys_1': pulleys1catch, 
    'pulleys_2': pulleys2catch,
    }

    var toyID = catchTrials[meta[0].strokes[0].toy_id];

    var catchTrial = _.extend({}, toyID, new Trial, {
          type: 'jspsych-stroke-annotations',
          catch: true,
        });

    // randomly insert catchTrial between trialnum 3-8
    const array = [2, 3, 4, 5, 6, 7];
    const rand = array[Math.floor(Math.random() * array.length)];

    // insert catchTrial into meta data
    // meta.splice(0, 0, catchTrial);
    meta.splice(rand, 0, catchTrial);
    
    // count all trials (including catchTrial)
    var numTrials = meta.length;    

    // get annotation trials, and add the plugin type attribute to each
    var trials = _.map(meta, function(trial, i) {
	  return _.extend({}, trial, new Trial, additionalInfo, {
        // trialNum will be 10 trials + 1 catchTrial
        trialNum: i,
        numTrials: numTrials,
	   })
    });    

    // add single video demonstration
    // this assumes that each session only involves annotating drawings
    // of a single machine so we can graby from first trial
    var demoURL = meta[0]['strokes'][0]['stim_url']; 
    var videoDemo = {
      type: 'jspsych-videodemo',
      stim_url: demoURL
    }        

    // add instruction pages
    instructionsHTML = {
      'str1': "<p> Welcome!</p><p>In this HIT, you will play a \
      fun game where you will see sketches of machines. Your task is to \
      tell us what each part of the sketch represents. Your \
      total time commitment is expected to be approximately 20 minutes, including \
      the time it takes to read these instructions. For your participation in this \
      game, you will be paid $4.00.<p> \
      <p>When you are finished, the HIT will be automatically submitted for \
      approval. You can only perform this HIT one time.</p> <p><i>We recommend \
      using Chrome. This HIT has not been tested in other browsers.</i></p>",
      'str2': "<p>You will see sketches made by somebody who was playing \
      a drawing game, in which they (<i>the sketcher</i>) made a sketch \
      of a machine, so that someone else (<i>the viewer</i>) could learn about it. \
      Every sketch is made up of a bunch of lines and curves that seem to \
      represent different parts of the machine. We are interested in learning what \
      you think each line or curve correponds to. </p>\
      <img class='introImgs' src='stim/introGraphic.png'>",
      'str3': "<p>Before you see the sketches, you will \
      watch a short video demonstrating what the machine looks like and how it works. \
      On every machine, there are 2 red components that are connected to 2 wires. \
      When these components are connected, the light bulb turns on.</p> \
      <p>Here is an example of what a video demonstration may look like.</p> \
      <video class='introImgs' autoplay loop> <source src='stim/introVideo.mp4' type='video/mp4'>", 
      'str4': "<p> On each trial, you will see a reference picture of the machine on the left side of the screen, \
      a menu of labels in the middle, and a sketch on the right. Each \
      label will correspond to a part of the machine in the picture. The picture \
      will be color-coded and numbered by the different parts of the machine. Note \
      that the numbers in the picture correspond to the numbers of the labels.</p>\
      <img class='introImgs' src='stim/introExample.png'>",
      'str5': "<p>We will highlight a specific line in green, and your task will be to \
      label the part of the machine that it corresponds to. \
      If you see a line in the drawing that does not refer to any part in \
      the machine or you cannot tell what the line is, you can select the 'I can't tell' label.</p>\
      <p><video class='introImgs' autoplay loop> <source src='stim/introTrial.mp4' type='video/mp4'></p> \
      <p>Once you are done with all the lines for the current sketch, you will move onto the next sketch. \
      <i>Try to be as careful as possible.</i> You cannot undo your answer once you select a label.</p>",
      'str6': "<p>Sometimes, you will see things, like arrows or motion lines. When \
      they are highlighted in green, you can label them as a 'symbol'. After you \
      select the 'symbol' label, a new menu of labels will appear. You should then label the part(s) of \
      the machine that the symbol refers to. \
      You can select as many parts of the machine that you think the symbol refers to.</p> \
      <p>For example, in the below example, the arrow refers to \
      the third and fourth gears, so you would want to select the labels '3 gear' and '4 gear'.</p> \
      <p><video class='introImgs' autoplay loop > <source src='stim/introSymtrial.mp4' type='video/mp4'></p> \
      <p>When you are done labeling what the symbol refers to, click the 'done' button and \
      you will move onto a new highlighted line.</p>",
      'str7': "<p>That's it! When you're ready, click 'Next' to complete a short quiz and begin the HIT.</p>"
    };

    // add consent pages
    consentHTML = {
      'str1': ["<u><p id='legal'>Consent to Participate</p></u>",
        "<p id='legal'>By completing this HIT, you are participating in a \
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
      Institutional Review Board.</p><p>Click 'Next' to continue \
      participating in this HIT.</p>"
      ].join(' ')
    };

    //combine instructions and consent
    var introMsg0 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str1,
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str2,
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true, 
      delayTime: 2000,
    };

    var introMsg1 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str3
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true, 
      delayTime: 6000,
    };

    var introMsg2 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str4,
        instructionsHTML.str5,
        instructionsHTML.str6
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: true, 
      delayTime: 2000,
    };

    var introMsg3 = {
      type: 'instructions',
      pages: [
        instructionsHTML.str7
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false
    };

    // Add comprehension check
    var quizTrial = {
      type: 'survey-multi-choice',
      preamble: "<b><u>Quiz</u></b><p>Before completing the next part of this HIT, \
      please complete the following quiz as practice to ensure that you understand the task.</p>",
      questions: [{
          prompt: "<b>Question 1</b><img class='quizImgs' src='stim/quiz_example1.png'> \
          What label should you click on if you see this line highlighted in green?",
          name: 'whatToLabel1',
          horizontal: false,
          options: ["1 gear ", "2 gear ", "3 gear ", "4 gear ", "5 background ", "6 light", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 2</b><img class='quizImgs' src='stim/quiz_example2.png'> \
          What label should you click on if you see this line highlighted in green?",
          name: 'whatToLabel2',
          horizontal: false,
          options: ["1 gear ", "2 gear ", "3 gear ", "4 gear ", "5 background ", "6 light", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 3</b><img class='quizImgs' src='stim/quiz_example3.png'> \
          What label should you click on if you see this line highlighted in green?",
          name: 'whatToLabel3',
          horizontal: false,
          options: ["1 gear ", "2 gear ", "3 gear ", "4 gear ", "5 background ", "6 light", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 4</b><img class='quizImgs' src='stim/quiz_arrow1.png'> \
          If you see an arrow like this, what should you label it?",
          name: 'whatToLabelArrow',
          horizontal: false,
          options: ["1 gear ", "2 gear ", "3 gear ", "4 gear ", "5 background ", "6 light", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 5</b><img class='quizImgs' src='stim/quiz_arrow2.png'> \
          This highlighted line is a symbol (an arrow). <i>How many</i> items does this symbol refers to? \
          (For example, if this arrow was meant to show movement between <i>all</i> the gears, you would say that it refers to 4 items.)",
          name: "howManyToLabelSymbol",
          horizontal: false,
          options: ["1 ", "2 ", "3 "],
          required: true
        },
        {
          prompt: "<b>Question 6</b><img class='quizImgs' src='stim/quiz_motion.png'> \
          If you see motion lines like this, what should you label it?",
          name: "whatToLabelMotion",
          horizontal: false,
          options: ["1 gear ", "2 gear ", "3 gear ", "4 gear ", "5 background ", "6 light", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 7</b><br>If you don't know what something is or think that the lines depicts an obect \
          that is not a part of the reference picture, what should you label it?",
          name: "whatToLabelUnintelligible",
          horizontal: false,
          options: ["5 background ", "I can't tell ", "symbol "],
          required: true
        },
        {
          prompt: "<b>Question 8</b><br>Can you do this HIT more than once?",
          name: "howManyTimesHIT",
          horizontal: false,
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
        if ((resp['whatToLabel1'] == '3 gear ') && 
        (resp['whatToLabel2'] == '2 gear ') && 
        (resp['whatToLabel3'] == '5 background ') && 
        (resp['whatToLabelArrow'] == 'symbol ') && 
        (resp['howManyToLabelSymbol'] == '2 ') && 
        (resp['whatToLabelMotion'] == 'symbol ') && 
        (resp['whatToLabelUnintelligible'] == "I can't tell ") && 
        (resp['howManyTimesHIT'] == 'No ')) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };

    // exit survey trials
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo ));
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
          prompt: "How difficult did you find this HIT? (1: very easy, 7: very hard)",
          name: "judgedDifficulty",
          horizontal: true,
          options: ["1", "2", "3", "4", "5", "6", "7"],
          required: true
        },
        {
          prompt: "Did you encounter any technical difficulties while completing this HIT? \
          This could include: videos were glitchy (e.g., did not load, froze, or appeared \
          to stop too soon), labelling interface was glitchy, or sections of the HIT did \
          not load properly.",
          name: "technicalDifficultiesBinary",
          horizontal: true,
          options: ["Yes", "No"],
          required: true
        }
      ],
      on_finish: main_on_finish
    });

    // Add survey page after trials are done
    var surveyTextInfo = _.omit(_.extend({}, new Trial, additionalInfo));
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
          placeholder: "2020",
          require: true
        },
        {
          name: 'participantComments',
          prompt: "Thank you for participating in our HIT! Do you have any other comments or feedback \
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
        Click NEXT to submit this HIT.'
      ],
      show_clickable_nav: true,
      allow_backward: false,
      delay: false, 
      on_finish: function() {
        sendData();
      }
    };


    // add all experiment elements to trials array
    if(includeDemo) trials.unshift(videoDemo);
    if(includeQuiz) trials.unshift(loopNode);
    if(includeIntro) trials.unshift(introMsg3);
    if(includeIntro) trials.unshift(introMsg2);
    if(includeIntro) trials.unshift(introMsg1);
    if(includeIntro) trials.unshift(introMsg0);
    if(includeExitSurvey) trials.push(exitSurveyChoice);
    if(includeExitSurvey) trials.push(exitSurveyText);
    if(includeGoodbye) trials.push(goodbye);
    
    console.log('trials', trials);

    // set up images for preload
    var imagePaths = [
      'stim/gears_1_annotations.png',
      'stim/gears_2_annotations.png',
      'stim/levers_1_annotations.png',
      'stim/levers_2_annotations.png',
      'stim/pulleys_1_annotations.png',
      'stim/pulleys_2_annotations.png', 
      'stim/introGraphic.png',
      'stim/introExample.png', 
      'stim/quiz_example1.png',
      'stim/quiz_example2.png',
      'stim/quiz_arrow1.png',
      'stim/quiz_arrow2.png', 
      'stim/quiz_motion.png'
      ];

    // set up videos for preload
    var videoPaths = [
      'stim/introVideo.mp4', 
      'stim/introTrial.mp4', 
      'stim/introSymtrial.mp4'
    ];

    // grab stim_url from videodemo.js
    var demoTrial = _.filter(trials, {
      'type': 'jspsych-videodemo'
    });

    var url_stim = _.map(demoTrial, function(n, i) {
      return n['stim_url']
    });

    // add this stim_url demo to the videopaths list
    videoPaths.push(url_stim);

    jsPsych.init({
      timeline: trials,
      default_iti: 1000,
      preload_video: videoPaths,
      preload_images: imagePaths,
      show_progress_bar: true
    });

  }); // close onConnected
} // close setup game
