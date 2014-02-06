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
	
	Hm... Not really needed unless we add some usefull methods...
\* ------------------------------------------------------------------------ *
function cJobSchEdTask(isCurrent, oTaskStartValues)
{
	// init basic attributes with default
	this.intPersonId = -1;
	this.strPersonName = '';
	this.strDateStart = '';
	this.strDateEnd = '';
	this.intActivityId = -1;

	// non default
	if (typeof(oTaskStartValues)!='undefined')
	{
		if (typeof(oTaskStartValues.intPersonId)!='undefined') this.intPersonId = oTaskStartValues.intPersonId;
		if (typeof(oTaskStartValues.strPersonName)!='undefined') this.strPersonName = oTaskStartValues.strPersonName;
		if (typeof(oTaskStartValues.strDateStart)!='undefined') this.strDateStart = oTaskStartValues.strDateStart;
		if (typeof(oTaskStartValues.strDateEnd)!='undefined') this.strDateEnd = oTaskStartValues.strDateEnd;
		if (typeof(oTaskStartValues.intActivityId)!='undefined') this.intActivityId = oTaskStartValues.intActivityId;
	}
}
/**/