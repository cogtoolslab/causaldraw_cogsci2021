jsPsych.plugins['jspsych-full-screen-button'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-full-screen-button',
    parameters: {      
      prompt: {
      type: jsPsych.plugins.parameterType.STRING,
      pretty_name: 'Prompt',
      default: null,
      description: 'Any content here will be displayed below the stimulus.'
      }
    } //close parameters
  } // close plugin.info

  plugin.trial = function(display_element, trial) {

    var html = '';
    // add prompt
    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add clickable icon
    html += '<div id="laptop"><img src="stim/laptop.png" height=50>'
    html += '</div>'
    display_element.innerHTML = html;

    $('#laptop').click(function() {
      console.log('checking');
      var elem = document.documentElement; // Make the body go full screen.
      requestFullScreen(elem);
    });

    function requestFullScreen(element) {
      // Supports most browsers and their versions.
      var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen ||
        element.mozRequestFullScreen || element.msRequestFullScreen;

      if (requestMethod) { // Native full screen.
        requestMethod.call(element);
      } else if (typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
          wscript.SendKeys("{F11}");
        }
      } // close else if statement
      setTimeout(endTrial(), 1000);
    } // close requestFullScreen function

    function endTrial() {
      jsPsych.finishTrial(); // move on to the next trial
    };
  }; // close plugin.trial

  return plugin;
})();