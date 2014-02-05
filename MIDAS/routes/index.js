
/*
 * GET home page.
 */

exports.index = function(req, res){

  //res.render('index', { title: JSON.stringify(req.url)});
  res.render('index', { title: MIDAS agents demo});

};

exports.management = function(req, res){

	res.render('management', { data: {agentAddress: "call here for info"} }); //TODO: put address of management agent here, will be relayed to page's javascript
};


exports.gui = function(req, res){

	console.log(req.url);
	
	var guipath	= req.url.substring(1); // remove first /

	//TODO: do something different depending on url:     
	//gui/worker    generic worker interface with dropdown menu for actual agent selection
	//gui/worker/w1 worker interface with w1 agent selected
	//gui/worker/   list of agents that when clicked are opened with worker interface

	var guipath2 = guipath.substring(0, guipath.lastIndexOf("/"))
	var agentname = guipath.substring(guipath.lastIndexOf("/") + 1);
	console.log(guipath2);
	console.log(agentname);

	try {
		res.render(guipath2, {agent: agentname} );
	} catch (e) {
		//TODO: render some nice page showing the error message
	}

	//res.render('gui', { data: {agentAddress: "call here for info"} });
};

