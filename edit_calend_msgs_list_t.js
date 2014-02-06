/* ------------------------------------------------------------------------ *\
	Show and other methods for listing tasks
\* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ *\
	Show/build list window
\* ------------------------------------------------------------------------ */
oJobSchEd.showListTasksWindow = function(intPersonId)
{
	var msg = this.oMsgListTasks;
	
	// show form
	msg.repositionMsgCenter();
	this.oNewTask = new Object();
	
	// tasks list
	var strList = '<ul style="text-align:left">';
	var i = this.indexOfPerson(intPersonId);
	// unexpected error (person should be known)
	if (i<0)
	{
		return;
	}
	for (var j=0; j<this.arrPersons[i].arrActivities.length; j++)
	{
		var t = this.arrPersons[i].arrActivities[j]
		strList += ''
			+'<li>'
				+'<a href="javascript:oJobSchEd.showEditTaskWindow('+t.intId.toString()+')">'
					+t.strDateStart+" - "+t.strDateEnd
					+": "+this.lang.activities[t.intId].name
				+'</a>'
			+'</li>'
		;
	}
	strList += ''
		+'<li>'
			+'<a href="javascript:oJobSchEd.showAddTaskWindow('+this.arrPersons[i].intId.toString()+')">'
				+this.lang['label - new activity']
			+'</a>'
		+'</li>'
	;
	strList += '</ul>';
	// fields setup
	msg.show(strList);
}

/* ------------------------------------------------------------------------ *\
	Refresh list
\* ------------------------------------------------------------------------ */
oJobSchEd.refreshListTasksWindow = function()
{
	// close previous
	var msg = this.oMsgListTasks;
	msg.close();

	// show again
	this.showListTasksWindow();
}