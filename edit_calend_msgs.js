/* ------------------------------------------------------------------------ *\
	Show/submit methods for task/activity modification (add&edit)
\* ------------------------------------------------------------------------ */

oJobSchEd.oModTask = new Object();

/* ------------------------------------------------------------------------ *\
	Show/build add task window
\* ------------------------------------------------------------------------ */
oJobSchEd.oModTask.showAdd = function(intPersonId)
{
	var msg = this.oMsg;
	
	// show form
	msg.repositionMsgCenter();
	this.oParent.oNewTask = new Object();
	
	// persons labels
	var oPersonLbls = new Array();
	for (var i=0; i<this.oParent.arrPersons.length; i++)
	{
		oPersonLbls[oPersonLbls.length] = {
			value	: this.oParent.arrPersons[i].intId,
			lbl		: this.oParent.arrPersons[i].strName
		};
	}
	// activities labels
	var oActivityLbls = new Array();
	for (var i=0; i<this.oParent.lang.activities.length; i++)
	{
		oActivityLbls[oActivityLbls.length] = {
			value	: i,
			lbl		: this.oParent.lang.activities[i].name
		};
	}
	// defaults
	this.oParent.oNewTask.intPersonId = (typeof(intPersonId)=='undefined' ? oPersonLbls[0].value : intPersonId);
	this.oParent.oNewTask.intActivityId = oActivityLbls[0].value;
	var now = new Date();
	this.oParent.oNewTask.strDateStart = now.dateFormat(this.oParent.conf.strFormat);
	this.oParent.oNewTask.strDateEnd = now.dateFormat(this.oParent.conf.strFormat);
	// fields setup
	var arrFields = [
		{type:'select', title: this.oParent.lang['label - person'], lbls : oPersonLbls, value:this.oParent.oNewTask.intPersonId, jsUpdate:'oJobSchEd.oNewTask.intPersonId = this.value'},
		{type:'select', title: this.oParent.lang['label - activity'], lbls : oActivityLbls, value:this.oParent.oNewTask.intActivityId, jsUpdate:'oJobSchEd.oNewTask.intActivityId = this.value'},
		{type:'text', maxlen: 10, lbl: this.oParent.lang['label - date start'], value:this.oParent.oNewTask.strDateStart, jsUpdate:'oJobSchEd.oNewTask.strDateStart = this.value'},
		{type:'text', maxlen: 10, lbl: this.oParent.lang['label - date end'], value:this.oParent.oNewTask.strDateEnd, jsUpdate:'oJobSchEd.oNewTask.strDateEnd = this.value'}
	]
	var strHTML = this.oParent.createForm(arrFields, this.oParent.lang['form header - add']);
	msg.show(strHTML, 'oJobSchEd.oModTask.submitAdd()');
}

/* ------------------------------------------------------------------------ *\
	Submit add task window
	
	TODO: some validation of dates?
\* ------------------------------------------------------------------------ */
oJobSchEd.oModTask.submitAdd = function()
{
	// data parse
	this.oParent.oNewTask.intPersonId = parseInt(this.oParent.oNewTask.intPersonId);
	this.oParent.oNewTask.intActivityId = parseInt(this.oParent.oNewTask.intActivityId);
	var intP = this.oParent.indexOfPerson(this.oParent.oNewTask.intPersonId)
	if (intP!=-1)
	{
		this.oParent.oNewTask.strPersonName = this.oParent.arrPersons[intP].strName;
	}
	else
	{
		jsAlert(this.oParent.lang["gantt add error - unknown person"]);
		return;
	}

	// add task
	this.oParent.addTask (this.oParent.oNewTask);
	
	// common stuff (rebuild, refresh...)
	this.submitCommon();
}

/* ------------------------------------------------------------------------ *\
	Common stuff done at the end of submit
\* ------------------------------------------------------------------------ */
oJobSchEd.oModTask.submitCommon = function()
{
	// build
	var strWikicode = this.oParent.buildWikicode();
	// output
	this.oParent.setContents(strWikicode);
	// close
	this.oMsg.close();
	
	// refresh window<del>s</del>
	//this.oParent.oListPersons.refresh();
	this.oParent.oListAct.refresh();
}