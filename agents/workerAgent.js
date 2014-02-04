var AgentBase = require("./agentBase.js");  //relaying the constructor to the agentBase
module.exports = AgentBase;
var myAgent = AgentBase.prototype;

//we're extending the prototype for the "agentbase" in agentBase.js with our own functionality
//this allows us to abstract away nasty bookkeeping tasks and allowing the programmer to focus on the agent functionality
// this agent is rather simple and only has some stateless math functions availabla

myAgent.init = function() {
	
	this.registerAddressForRPCs('http', "agents/" + this.agentName); 

	this.schedule = [];

	// no further init necessary
	console.log("workerAgent added");
}

myAgent.RPCfunctions.getSchedule = function (params, callback) {

    callback({id: 0, result: this.schedule, error:null });

};

myAgent.RPCfunctions.updateSchedule = function (params, callback) {

	this.schedule = params.schedule;
	console.log(this.schedule);

    callback({id: 0, result: "ok", error:null });

};


myAgent.RPCfunctions.reportNC = function (params, callback) {

	this.send("http://127.0.0.1:3000/" + this.namePrefix + "/Peet", 
					{method:"reportNC", id:0, params: {NC: {cause: params.cause, origin: this.agentName} } }, 
					function(answer){ }); //dont have to do anything with the answer... we're just pushing the result

    callback({id: 0, result: "reported", error:null });

};



