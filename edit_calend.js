// <nowiki>
/* ------------------------------------------------------------------------ *\
    Job Schedule Edit

	Needed external modules:
	* JSWikiGantt ver. 0.3.0 or higher
	* sftJSmsg ver 0.3.0 or higher
 
	Description:
	-
 
    Copyright:  ©2010 Maciej Jaros (pl:User:Nux, en:User:EcceNux)
     Licencja:  GNU General Public License v2
                http://opensource.org/licenses/gpl-license.php
\* ------------------------------------------------------------------------ */
//  wersja:
	var tmp_VERSION = '0.0.2';  // = oJobSchEd.version = oJobSchEd.ver
// ------------------------------------------------------------------------ //

/* =====================================================
	Object Init
   ===================================================== */
if (oJobSchEd!=undefined)
{
	jsAlert('Błąd krytyczny - konflikt nazw!\n\nJeden ze skryptów używa już nazwy oJobSchEd jako zmienną globalną.');
}
var oJobSchEd = new Object();
oJobSchEd.ver = oJobSchEd.version = tmp_VERSION;

oJobSchEd.conf = {"":""
	,reGantMatch : /(<jsgantt[^>]*>)([\s\S]+)(<\/jsgantt>)/
	,isActivitiesIdentfiedByName : true	// Allows colors to be different then in the setup.
										// Note that colors will be changed upon output to those setup below.
	// allowed gantt tags? -> error when unsupported tags are found (to avoid editing non-JobSch diagrams)
}
oJobSchEd.lang = {"":""
	,"button label" : "Edytuj kalendarz"
	,"gantt not found" : "Na tej stronie nie znaleziono kalendarza. Dodaj tag &lt;jsgantt autolink='0'&gt;&lt;/jsgantt&gt;, aby móc rozpocząć edycję."
	,"gantt parse error - general" : "Błąd parsowania kodu. Ten diagram prawdopodobnie nie jest kalendarzem."
	,"gantt parse error - no id and name at nr" : "Błąd parsowania kodu przy zadaniu numer %i%. Kod diagramu jest nietypowy, albo uszkodzony."
	,"gantt parse error - at task" : "Błąd parsowania kodu przy zadaniu o id %pID% (nazwa: %pName%). Ten diagram nie jest kalendarzem, albo są w nim błędy."
	,"gantt parse error - unknow activity" : "Błąd! Nieznana aktywność (nazwa: %pRes%, kolor: %pColor%). Ten diagram nie jest kalendarzem, albo są w nim błędy."
	,"gantt build error - at task" : "Błąd budowania wiki-kodu przy zadaniu o id %pID% (nazwa: %pName%).\nBłąd: %errDesc%."
	,"activities" : [
		{name: "Urlop", color:"00cc00"},
		{name: "Delegacja", color:"0000cc"},
		{name: "Choroba", color:"990000"}
	]
}
/* ------------------------------------------------------------------------ *\
	Add edit button and init messages
\* ------------------------------------------------------------------------ */
oJobSchEd.init = function()
{
	this.addEdButton()
}
if (wgAction=="edit" || wgAction=="submit")
{
	addOnloadHook(function() {oJobSchEd.init()});
}

/* ------------------------------------------------------------------------ *\
	Add edit button
\* ------------------------------------------------------------------------ */
oJobSchEd.addEdButton = function()
{
	var elTB = document.getElementById('toolbar');
	if (!elTB)
	{
		return;
	}
	
	var nel = document.createElement('a');
	nel.href = "javascript:oJobSchEd.startEdit()";
	nel.style.cssText = "float:right";
	nel.appendChild(document.createTextNode(this.lang["button label"]));
	elTB.appendChild(nel);
}

/* ------------------------------------------------------------------------ *\
	Init internal structures and show edit window
\* ------------------------------------------------------------------------ */
oJobSchEd.startEdit = function()
{
	var strWikicode = this.getContents();
	if (strWikicode===false)
	{
		jsAlert(this.lang["gantt not found"])
	}
	if (!this.parse(strWikicode))	// on errors messages are displayed inside parse()
	{
		return;
	}
	//this.showWindow("edit");
	// tmp
	strWikicode = this.buildWikicode();
	this.setContents(strWikicode);
}

/* ------------------------------------------------------------------------ *\
	Gets contents of jsgantt tag
\* ------------------------------------------------------------------------ */
oJobSchEd.getContents = function()
{
	this.elEditArea = document.getElementById('wpTextbox1');
	var el = this.elEditArea;
	var m = el.value.match(this.conf.reGantMatch);
	if (m)
	{
		return m[2];
	}
	return false;
}
/* ------------------------------------------------------------------------ *\
	Replace contents of jsgantt tag
\* ------------------------------------------------------------------------ */
oJobSchEd.setContents = function(strWikicode)
{
	var el = this.elEditArea;
	el.value = el.value.replace(this.conf.reGantMatch, "$1"+strWikicode+"$3");
}

/* ------------------------------------------------------------------------ *\
	Parse jsgantt tag contents into inner structures
	
	false on error
\* ------------------------------------------------------------------------ */
oJobSchEd.parse = function(strWikicode)
{
	var docXML = this.parseToXMLDoc(strWikicode);
	var elsTasks = docXML.getElementsByTagName('task');
	this.arrPersons = new Array();
	for (var i=0; i<elsTasks.length; i++)
	{
		var oTask = this.preParseTask(elsTasks[i]);
		if (oTask===false)
		{
			return false;
		}
		var intPer = this.indexOfPerson (oTask.intPersonId);
		// new person?
		if (intPer==-1)
		{
			intPer = this.arrPersons.length;
			this.arrPersons[intPer] = {
				intId : oTask.intPersonId,
				strName : oTask.strPersonName,
				arrActivities : new Array()
			}
		}
		// add activity
		this.arrPersons[intPer].arrActivities[this.arrPersons[intPer].arrActivities.length] = {
			strDateStart : oTask.strDateStart,
			strDateEnd : oTask.strDateEnd,
			intId : oTask.intActivityId
		}
	}
	return true;
}

/* ------------------------------------------------------------------------ *\
	Pre parse single task/activity node
	
	Returns:
	false on error
	oTask on success
	{
		intPersonId		: parsed int as given by user
		strPersonName	: 'str as given by user'
		strDateStart	: 'date str as given by user'
		strDateEnd		: 'date str as given by user'
		intActivityId	: numeric index in this.lang.activities
	}

	Expected content of nodeTask:
    <pID>10</pID>
    <pName>Maciek</pName>
    <pStart>2010-07-15</pStart>
    <pEnd>2010-07-30</pEnd>
    <pColor>0000ff</pColor>
    <pRes>Urlop</pRes>
\* ------------------------------------------------------------------------ */
oJobSchEd.preParseTask = function(nodeTask)
{
	var oTask = new Object();
	
	// osoba
	try
	{
		oTask.intPersonId = parseInt(nodeTask.getElementsByTagName('pID')[0].textContent);
		oTask.strPersonName = nodeTask.getElementsByTagName('pName')[0].textContent;
	}
	catch (e)
	{
		jsAlert(this.lang["gantt parse error - no id and name at nr"].replace(/%i%/g, i));
		return false;
	}
	try
	{
		// daty
		oTask.strDateStart = nodeTask.getElementsByTagName('pStart')[0].textContent;
		oTask.strDateEnd = nodeTask.getElementsByTagName('pEnd')[0].textContent;
		// rodzaj (nie)aktywności
		var pColor = nodeTask.getElementsByTagName('pColor')[0].textContent;
		var pRes = nodeTask.getElementsByTagName('pRes')[0].textContent;
		oTask.intActivityId = this.getActivityId(pRes, pColor);
		if (oTask.intActivityId<0)
		{
			jsAlert(this.lang["gantt parse error - unknow activity"]
				.replace(/%pRes%/g, pRes)
				.replace(/%pColor%/g, pColor)
			);
			return false;
		}
	}
	catch (e)
	{
		jsAlert(this.lang["gantt parse error - at task"]
			.replace(/%pID%/g, oTask.intPersonId)
			.replace(/%pName%/g, oTask.strPersonName)
		);
		return false;
	}

	return oTask;
}

/* ------------------------------------------------------------------------ *\
	Find person in the this.arrPersons array
	
	index when found, -1 if not found
\* ------------------------------------------------------------------------ */
oJobSchEd.indexOfPerson = function(intPersonId)
{
	for (var i=0; i<this.arrPersons.length; i++)
	{
		if (this.arrPersons[i].intId==intPersonId)
		{
			return i;
		}
	}
	return -1;
}

/* ------------------------------------------------------------------------ *\
	Get activity id (index) from color and resource name
	-1 => unknown
\* ------------------------------------------------------------------------ */
oJobSchEd.getActivityId = function(pRes, pColor)
{
	//"activities"
	for (var i=0; i<this.lang.activities.length; i++)
	{
		// name must be matched, color configurable
		if (this.lang.activities[i].name == pRes 
			&& (this.conf.isActivitiesIdentfiedByName || this.lang.activities[i].color == pColor)
		)
		{
			return i;
		}
	}
	return -1;
}

/* ------------------------------------------------------------------------ *\
	preparse XML to an XML document DOM
\* ------------------------------------------------------------------------ */
oJobSchEd.parseToXMLDoc = function(strWikicode)
{
	strWikicode = "<root>"+strWikicode+"</root>";
	var docXML;
	if (window.DOMParser)
	{
		var parser = new DOMParser();
		docXML = parser.parseFromString(strWikicode, "text/xml");
	}
	else // Internet Explorer
	{
		docXML = new ActiveXObject("Microsoft.XMLDOM");
		docXML.async = "false";
		docXML.loadXML(strWikicode);
	}
	return docXML;
}

/* ------------------------------------------------------------------------ *\
	Build wikicode from internal structures
\* ------------------------------------------------------------------------ */
oJobSchEd.buildWikicode = function()
{
	var strWikicode = '';
	for (var i=0; i<this.arrPersons.length; i++)
	{
		for (var j=0; j<this.arrPersons[i].arrActivities.length; j++)
		{
			// preapre task object
			var oTask =
			{
				intPersonId		: this.arrPersons[i].intId,
				strPersonName	: this.arrPersons[i].strName,
				strDateStart	: this.arrPersons[i].arrActivities[j].strDateStart,
				strDateEnd		: this.arrPersons[i].arrActivities[j].strDateEnd,
				intActivityId	: this.arrPersons[i].arrActivities[j].intId
			}
			// render and add code
			strWikicode += this.buildTaskcode(oTask);
		}
	}
	return strWikicode;
}

/* ------------------------------------------------------------------------ *\
	Build single task code
	
	Returns:
	'' (empty str) on error
	wiki code (XML) for the task
	
	oTask =
	{
		intPersonId		: parsed int as given by user
		strPersonName	: 'str as given by user'
		strDateStart	: 'date str as given by user'
		strDateEnd		: 'date str as given by user'
		intActivityId	: numeric index in this.lang.activities
	}

	Ouput of nodeTask:
    <pID>10</pID>
    <pName>Maciek</pName>
    <pStart>2010-07-15</pStart>
    <pEnd>2010-07-30</pEnd>
    <pColor>0000ff</pColor>
    <pRes>Urlop</pRes>
\* ------------------------------------------------------------------------ */
oJobSchEd.buildTaskcode = function(oTask)
{
	var strWikiCode = '';

	try
	{
		strWikiCode = '\n<task>'
			+'\n\t<pID>'+oTask.intPersonId+'</pID>'
			+'\n\t<pName>'+oTask.strPersonName+'</pName>'
			+'\n\t<pStart>'+oTask.strDateStart+'</pStart>'
			+'\n\t<pEnd>'+oTask.strDateEnd+'</pEnd>'
			+'\n\t<pColor>'+this.lang.activities[oTask.intActivityId].color+'</pColor>'
			+'\n\t<pRes>'+this.lang.activities[oTask.intActivityId].name+'</pRes>'
			+'\n</task>'
		;
	}
	catch (e)
	{
		jsAlert(this.lang["gantt build error - at task"]
			.replace(/%pID%/g, oTask.intPersonId)
			.replace(/%pName%/g, oTask.strPersonName)
			.replace(/%errDesc%/g, e.description)
		);
		return '';
	}

	return strWikiCode;
}

// </nowiki>