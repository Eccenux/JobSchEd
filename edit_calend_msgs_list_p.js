/* ------------------------------------------------------------------------ *\
	Show and other methods for listing persons
\* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ *\
	Show/build list window
\* ------------------------------------------------------------------------ */
oJobSchEd.showListPersonsWindow = function()
{
	var msg = this.oMsgListPersons;
	
	// show form
	msg.repositionMsgCenter();
	this.oNewTask = new Object();
	
	// persons list
	var strList = '<ul style="text-align:left">';
	for (var i=0; i<this.arrPersons.length; i++)
	{
		strList += ''
			+'<li>'
				+'<a href="javascript:oJobSchEd.showListTasksWindow('+this.arrPersons[i].intId.toString()+')">'
					+this.arrPersons[i].strName
				+'</a>'
			+'</li>'
		;
	}
	strList += '</ul>';
	// fields setup
	msg.show(strList);
}

/* ------------------------------------------------------------------------ *\
	Refresh list
\* ------------------------------------------------------------------------ */
oJobSchEd.refreshListPersonsWindow = function()
{
	// close previous
	var msg = this.oMsgListPersons;
	msg.close();

	// show again
	this.showListPersonsWindow();
}