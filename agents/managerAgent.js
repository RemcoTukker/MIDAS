var AgentBase = require("./agentBase.js");  //relaying the constructor to the agentBase
module.exports = AgentBase;
var myAgent = AgentBase.prototype;

//we're extending the prototype for the "agentbase" in agentBase.js with our own functionality
//this allows us to abstract away nasty bookkeeping tasks and allowing the programmer to focus on the agent functionality
// this agent is rather simple and only has some stateless math functions availabla

myAgent.init = function() {
	
	this.registerAddressForRPCs('http', "agents/" + this.agentName);  

	this.NCs = [];

	// no further init necessary
	console.log("managerAgent added");
}

myAgent.RPCfunctions.getNCs = function (params, callback) {
    callback({id: 0, result: this.NCs, error:null });
};

myAgent.RPCfunctions.reportNC = function (params, callback) {
	this.NCs.push(params.NC);
    callback({id: 0, result: "noted", error:null });
};

myAgent.RPCfunctions.fixNCs = function (params, callback) {
	this.NCs = [];
    callback({id: 0, result: "Piece of cake!", error:null });
};

myAgent.RPCfunctions.cookUpNewSchedule = function (params, callback) {

	var newSchedule = [];

	console.log("scheduling anew " + this.agentName)

	for (var prop in this.RPCfunctions) console.log(prop);

	var date = new Date();
	var date2 = new Date();
	//var time = date.getTime();
	//var endTime = date.getTime();

	for (var i = 0; i < 5; i++) {
		var mins = Math.round( Math.random() * 300 );
		console.log(mins);
		date2.setMinutes( date2.getMinutes() + mins);
		newSchedule.push({id:i, content:'Scrubbing the deck', start:date.getTime(), end:date2.getTime()});
		console.log(date + " " + date2);
		date.setTime(date2.getTime());
	}

	this.send("http://127.0.0.1:3000/agents/Remco", 
					{method:"updateSchedule", id:0, params: {schedule: newSchedule} }, 
					function(answer){ }); //dont have to do anything with the answer... we're just pushing the result

	this.send("http://127.0.0.1:3000/agents/Giovanni", 
					{method:"updateSchedule", id:0, params: {schedule: newSchedule} }, 
					function(answer){ }); //dont have to do anything with the answer... we're just pushing the result

    callback({id: 0, result: "dispatched new schedules", error:null });
};




