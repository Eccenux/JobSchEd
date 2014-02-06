// <nowiki>
/* ------------------------------------------------------------------------ *\
	Task class module
	
	Basic attributes of the object:
	{
		intPersonId		: parsed int as given by user
		strPersonName	: 'str as given by user'
		strDateStart	: 'date str as given by user'
		strDateEnd		: 'date str as given by user'
		intActivityId	: numeric index in this.lang.activities
	}
\* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ *\
	Constructor
	
	It's done this way as new oJobSchEd.oTask() don't seem to work...
\* ------------------------------------------------------------------------ */
function cJobSchEdTask(oTaskStartValues)
{
	// init basic attributes
	this.intPersonId = (typeof(oTaskStartValues.intPersonId)=='undefined' ? -1 : oTaskStartValues.intPersonId);
	this.strPersonName = (typeof(oTaskStartValues.strPersonName)=='undefined' ? '' : oTaskStartValues.strPersonName);
	this.strDateStart = (typeof(oTaskStartValues.strDateStart)=='undefined' ? '' : oTaskStartValues.strDateStart);
	this.strDateEnd = (typeof(oTaskStartValues.strDateEnd)=='undefined' ? '' : oTaskStartValues.strDateEnd);
	this.intActivityId = (typeof(oTaskStartValues.intActivityId)=='undefined' ? -1 : oTaskStartValues.intActivityId);
}
// </nowiki>