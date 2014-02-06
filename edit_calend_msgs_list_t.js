/* ------------------------------------------------------------------------ *\
	Show and other methods for listing tasks/activities
\* ------------------------------------------------------------------------ */

oJobSchEd.oListAct = new Object();

/* ------------------------------------------------------------------------ *\
	Show/build list window
\* ------------------------------------------------------------------------ */
oJobSchEd.oListAct.show = function(intPersonId)
{
	var msg = this.oMsg;
	
	// remeber last (for refresh)
	if (typeof(intPersonId)=='undefined')
	{
		intPersonId = this.intLastPersonId;
	}
	this.intLastPersonId = intPersonId;
	
	// show form
	msg.repositionMsgCenter();
	
	// tasks list
	var strList = '<ul style="text-align:left">';
	var i = this.oParent.indexOfPerson(intPersonId);
	// unexpected error (person should be known)
	if (i<0)
	{
		return;
	}
	var oP = this.oParent.arrPersons[i];
	for (var j=0; j<oP.arrActivities.length; j++)
	{
		var oA = oP.arrActivities[j]
		if (typeof(oA)=='undefined')	// might be empty after del
		{
			continue;
		}
		strList += ''
			+'<li>'
				+'<a href="javascript:oJobSchEd.oModTask.showEdit('+oP.intId.toString()+', '+j.toString()+')">'
					+oA.strDateStart+" - "+oA.strDateEnd
					+": "+this.oParent.lang.activities[oA.intId].name
				+'</a>'
			+'</li>'
		;
	}
	strList += ''
		+'<li>'
			+'<a href="javascript:oJobSchEd.oModTask.showAdd('+oP.intId.toString()+')">'
				+this.oParent.lang['label - new activity']
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
oJobSchEd.oListAct.refresh = function()
{
	// close previous
	this.oMsg.close();

	// show again
	this.show();
}