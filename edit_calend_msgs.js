/* ------------------------------------------------------------------------ *\
	Show/submit methods
\* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ *\
	Show/build add task window
\* ------------------------------------------------------------------------ */
oJobSchEd.showAddTaskWindow = function()
{
	var msg = this.oMsg;
	
	// show form
	msg.repositionMsgCenter();
	this.oNewTask = new Object();
	
	// persons labels
	var oPersonLbls = new Array();
	for (var i=0; i<this.arrPersons.length; i++)
	{
		oPersonLbls[oPersonLbls.length] = {
			value	: this.arrPersons[i].intId,
			lbl		: this.arrPersons[i].strName
		};
	}
	// activities labels
	var oActivityLbls = new Array();
	for (var i=0; i<this.lang.activities.length; i++)
	{
		oActivityLbls[oActivityLbls.length] = {
			value	: i,
			lbl		: this.lang.activities[i].name
		};
	}
	// defaults
	this.oNewTask.intPersonId = oPersonLbls[0].value;
	this.oNewTask.intActivityId = oActivityLbls[0].value;
	var now = new Date();
	this.oNewTask.strDateStart = now.dateFormat(this.conf.strFormat);
	this.oNewTask.strDateEnd = now.dateFormat(this.conf.strFormat);
	// fields setup
	var arrFields = [
		{type:'select', title: this.lang['label - person'], lbls : oPersonLbls, value:this.oNewTask.intPersonId, jsUpdate:'oJobSchEd.oNewTask.intPersonId = this.value'},
		{type:'select', title: this.lang['label - activity'], lbls : oActivityLbls, value:this.oNewTask.intActivityId, jsUpdate:'oJobSchEd.oNewTask.intActivityId = this.value'},
		{type:'text', maxlen: 10, lbl: this.lang['label - date start'], value:this.oNewTask.strDateStart, jsUpdate:'oJobSchEd.oNewTask.strDateStart = this.value'},
		{type:'text', maxlen: 10, lbl: this.lang['label - date end'], value:this.oNewTask.strDateEnd, jsUpdate:'oJobSchEd.oNewTask.strDateEnd = this.value'}
	]
	var strHTML = this.createForm(arrFields, this.lang['form header - add']);
	msg.show(strHTML, 'oJobSchEd.submitAddTaskWindow()');
}

/* ------------------------------------------------------------------------ *\
	Submit add task window
	
	TODO: some validation of dates?
\* ------------------------------------------------------------------------ */
oJobSchEd.submitAddTaskWindow = function()
{
	// data parse
	this.oNewTask.intPersonId = parseInt(this.oNewTask.intPersonId);
	this.oNewTask.intActivityId = parseInt(this.oNewTask.intActivityId);
	var intP = this.indexOfPerson(this.oNewTask.intPersonId)
	if (intP!=-1)
	{
		this.oNewTask.strPersonName = this.arrPersons[intP].strName;
	}
	else
	{
		jsAlert(this.lang["gantt add error - unknown person"]);
		return;
	}

	// add task
	this.addTask (this.oNewTask);
	
	// build
	var strWikicode = this.buildWikicode();
	// output
	this.setContents(strWikicode);
	// close
	var msg = this.oMsg;
	msg.close();
}