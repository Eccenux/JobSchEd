/* ------------------------------------------------------------------------ *\
	Show and other methods for listing persons
\* ------------------------------------------------------------------------ */

oJobSchEd.oListPersons = new Object();

/* ------------------------------------------------------------------------ *\
	Show/build list window
\* ------------------------------------------------------------------------ */
oJobSchEd.oListPersons.show = function()
{
	var msg = this.oMsg;
	
	// show form
	msg.repositionMsgCenter();
	
	// persons list
	var strList = '<ul style="text-align:left">';
	for (var i=0; i<this.oParent.arrPersons.length; i++)
	{
		var oP = this.oParent.arrPersons[i];
		strList += ''
			+'<li>'
				+'<a href="javascript:oJobSchEd.oListAct.show('+oP.intId.toString()+')">'
					+oP.strName
				+'</a>'
				+' '
				+'<a href="javascript:oJobSchEd.oModPerson.showEdit('+oP.intId.toString()+')">'
					+'<img src="" alt="'
						+this.oParent.lang['alt - mod person']
					+'" />'
				+'</a>'
			+'</li>'
		;
	}
	strList += ''
		+'<li>'
			+'<a href="javascript:oJobSchEd.oModPerson.showAdd()">'
				+this.oParent.lang['label - new person']
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
oJobSchEd.oListPersons.refresh = function()
{
	// close previous
	this.oMsg.close();

	// show again
	this.show();
}