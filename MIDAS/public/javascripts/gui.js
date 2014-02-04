/**
 * This makes sure the DOM is loaded before starting the code. This ensures we can find the DOM elements we manipulate.
 */
window.onload = function() {
  // < loading global variables
  var lastData = "";
  var agentUrl = "/agents/";
  var updateInterval = 2000; // ms
  var agentAlive = false;
  var states = {};
  var agents = {};
  // end >


  // < loading the VIS library for the timeline functionality
  var container = document.getElementById('visualization');
  var items = new vis.DataSet({
    convert: {
      start: 'Date',
      end: 'Date'
    }
  });
  var date = new Date();
  var time = date.getTime();
  var options = {
    start: time - 2000000,
    end: time + 1000000,
    showCurrentTime:true,
    orientation:'bottom',
    height:250
  };
  var timeline = new vis.Timeline(container, items, options);
  // end >

  /**
   * This function communicates with the agent by construnction a HTTP POST request.
   *
   * @param {String} url
   * @param {String} method
   * @param {Object} params
   * @param {Function} callback
   */
  function askAgent(url,method,params,callback) {
    // create post request
    var POSTrequest = JSON.stringify({"id":0, "method": method, "params": params});

    // create XMLHttpRequest object to send the POST request
    var http = new XMLHttpRequest();

    // get a pointer to the DOM element that displays the status of the agent
    var agentStatusSpan = document.getElementById("agentStatusSpan");

    // open an asynchronous POST connection
    http.open("POST", url, false);

    // include header so the receiving code knows its a JSON object
    http.setRequestHeader("Content-type", "application/json");

    // insert the callback function. This is called when the message has been delivered and a response has been received
    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
        agentStatusSpan.innerHTML = "Agent status: ONLINE."
        agentAlive = true;

        // launch callback function
        callback(http.responseText);
      }
    }

    // using a try / catch to see if we can send a message to the agent. If this fails, the agent is down.
    try {
      http.send(POSTrequest);
      agentAlive = true;
    }
    catch(err) {
      agentAlive = false;
      agentStatusSpan.innerHTML = "Agent status: OFFLINE, attempting to reconnect.."
      return;
    }
  }

  /**
   * ask the status collector for an stringified array of current states for all connected agents.
   * this is then handled in the processData function.
   */
  function getAgentData() {
    askAgent(agentUrl + "statusCollector","getData", {}, function(response) {
      var receivedMsg = JSON.parse(response);
      var data = receivedMsg['data'];
      processData(data, "current");
    });
  }



  /**
   * ask the status collector for an stringified array of current states for all connected agents.
   * this is then handled in the processData function.
   */
  function getHistoryData() {
    askAgent(agentUrl + "historyCollector","getData", {}, function(response) {
      var receivedMsg = JSON.parse(response);
      var data = receivedMsg['data'];
      processData(data,"history");
    });
  }


  /**
   * This function loops through the array of entrees. There is one state entree per agent.
   * These are then handled in the handleAgentData function.
   *
   * @param {Object} data
   * @parem {String} method | history / current
   */
  function processData(data, method) {
    if (data) {
      var dataObject = JSON.parse(data);
      for (var agentId in dataObject) {
        if (dataObject.hasOwnProperty(agentId)) {
          if (method == "current") {
            handleAgentData(dataObject, agentId);
          }
          else {
            handleAgentHistory(dataObject, agentId);
          }
        }
      }
    }
  }


  /**
   * This function handles the data from each agent and stores it into the dataset if it is new
   * For all publishing sensors, we create control gui elements.
   *
   * @param {Object} dataObject  | object of {agentId: "string", ...}
   * @param {String} agentId
   */
  function handleAgentData(dataObject, agentId) {
    if (dataObject) {
      if (!agents.hasOwnProperty(agentId)) {
        createNewAgentUI(agentId);
        agents[agentId] = "active";
      }
      insertIntoDataset(dataObject[agentId], agentId);
      states[agentId] = dataObject[agentId];
    }
  }

  /**
   * This function handles the data from each agent and stores it into the dataset if it is new
   *
   * @param {Object} dataObject | object of {agentId: [], ...}
   * @param {String} agentId
   */
  function handleAgentHistory(dataObject, agentId) {
    if (dataObject) {
      var agentDataset = dataObject[agentId];
      for (var i = 0; i < agentDataset.length; i++) {
        insertIntoDataset(agentDataset[i], agentId);
        states[agentId] = agentDataset[i];
      }
    }
  }


  /**
   * This adds control buttons for the agents to the GUI
   * There are two settings, on and off.
   *
   * @param {String} agentId
   */
  function createNewAgentUI(agentId) {
    var controlDiv = document.getElementById("agentControls");

    var onButtonHTML  = "<input type='button' value='switch " + agentId + " on'  id='onBtn_" + agentId +"'>";
    var offButtonHTML = "<input type='button' value='switch " + agentId + " off' id='offBtn_"+ agentId +"'>";

    var newNode = document.createElement('div');
    newNode.innerHTML = onButtonHTML.concat(offButtonHTML);

    controlDiv.appendChild(newNode);

    bindButton("onBtn_" + agentId, "turnOn" , agentId);
    bindButton("offBtn_" +agentId, "turnOff", agentId);
  }


  /**
   * This function binds a function to the onclick event of a button.
   *
   * @param buttonId
   * @param action
   * @param agentId
   */
  function bindButton(buttonId, action, agentId) {
    var button = document.getElementById(buttonId);
    button.onclick = function() {
      askAgent(agentUrl + agentId,"sendMessage",{action: action}, function(response) {
        var receivedMsg = JSON.parse(response);
        var result = receivedMsg['result'];
        var commandSpan = document.getElementById("commandStatus");
        switch(action) {
          case "turnOn":
            if (result == "success") {
              commandSpan.innerHTML = "I asked " + agentId + " to switch on.";
            }
            else {
              commandSpan.innerHTML = "I failed to ask " + agentId + " to switch on.";
            }
            break;
          case "turnOff":
            if (result == "success") {
              commandSpan.innerHTML = "I asked " + agentId + " to switch off.";
            }
            else {
              commandSpan.innerHTML = "I failed to ask " + agentId + " to switch off.";
            }
            break;
        }
      });
    }
  }

  /**
   * This function returns the right icon type for the agents message to put in the timeline
   * If this cannot be found, the agentID is returned
   *
   * @param {Object} dataObject
   * @param {String} agentId
   * @returns {String}
   */
  function getContent(dataObject ,agentId) {
    var agentIdArray = agentId.split("-");
    var agentIdType  = agentIdArray[0];
    var content = agentId;

    switch (agentIdType) {
      case "doorAgent":
        if (dataObject.status == "1") {
          content = '<img src="images/open_doorIcon.png" width="31px" height="35px" />';
        }
        else {
          content = '<img src="images/closed_doorIcon.png" width="31px" height="35px" />';
        }
        break;
      case "lampAgent":
        if (dataObject.status == "1") {
          content = '<img src="images/bulb_on.png" width="22px" height="35px" />';
        }
        else {
          content = '<img src="images/bulb_off.png" width="22px" height="35px" />';
        }
        break;
    }
    return content;
  }

  /**
   * This function places an item from the agent into the dataset.
   *
   * @param {JSON.Stringified object} data  | {date:"YYYY-MM-DD",time:"HH:MM:SS",status:"OPEN/CLOSED"}
   * @param {String} agentId
   */
  function insertIntoDataset(data, agentId) {
    // check if the data is new
    if (states[agentId] != data) {
      // convert the stringified JSON object back into an Object
      var dataObject = JSON.parse(data);
      var timestamp = dataObject.date.concat("T",dataObject.time);
      var content = getContent(dataObject, agentId);

      // clear the command span
      var commandSpan = document.getElementById("commandStatus");
      commandSpan.innerHTML = "";

      // add to the dataset
      items.add({content: content, start: timestamp})
    }
    // remember the last entree so we do not get duplicates in our dataset
    lastData = data;
  }


  // get History on start.
  getHistoryData();
  // this creates the GUI elements, it will not add dupicate entrees.
  // the reason to do this here is that maybe we only want gui elements for sensors that
  // have been active in the last x time
  getAgentData();

  // recheck the agent for new information
  var refresher = window.setInterval( function() {
    getAgentData();
  }, updateInterval);
}