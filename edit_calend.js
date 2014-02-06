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
	var tmp_VERSION = '0.0.1';  // = oJobSchEd.version = oJobSchEd.ver
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
	if (!this.parse(strWikicode))	// errors inside
	{
		return;
	}
	//this.showWindow("edit");
	// tmp
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
	/*
    <pID>10</pID>
    <pName>Maciek</pName>
    <pStart>2010-07-15</pStart>
    <pEnd>2010-07-30</pEnd>
    <pColor>0000ff</pColor>
    <pRes>Urlop</pRes>
	*/
	var tasks = docXML.getElementsByTagName('task');
	this.arrActivities = [];
	for (var i=0; i<tasks.length; i++)
	{
		// osoba
		try
		{
			this.arrActivities[i] = new Object();
			this.arrActivities[i].personId = tasks[i].getElementsByTagName('pID')[0].textContent;
			this.arrActivities[i].personName = tasks[i].getElementsByTagName('pName')[0].textContent;
		}
		catch (e)
		{
			jsAlert(this.lang["gantt parse error - no id and name at nr"].replace(/%i%/g, i));
			return false;
		}
		try
		{
			// daty
			this.arrActivities[i].dateStart = tasks[i].getElementsByTagName('pStart')[0].textContent;
			this.arrActivities[i].dateEnd = tasks[i].getElementsByTagName('pEnd')[0].textContent;
			// rodzaj (nie)aktywności
			var pColor = tasks[i].getElementsByTagName('pColor')[0].textContent;
			var pRes = tasks[i].getElementsByTagName('pRes')[0].textContent;
			this.arrActivities[i].activityId = this.getActivityId(pRes, pColor);
			if (this.arrActivities[i].activityId<0)
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
				.replace(/%pID%/g, this.arrActivities[i].personId)
				.replace(/%pName%/g, this.arrActivities[i].personName)
			);
			return false;
		}
	}
	return true;
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
	return strWikicode;
}

// </nowiki>