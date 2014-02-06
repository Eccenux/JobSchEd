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
	var tmp_VERSION = '0.1.0';  // = oJobSchEd.version = oJobSchEd.ver
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
	,strFormat : 'Y-m-d'
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
	,"gantt add error - unknown person" : "Błąd! Wybrana osoba nie została znaleziona. Czy na pewno dodałeś(-aś) ją wcześniej?"
	,"form header - add" : "Dodaj wpis"
	,"label - person" : "Osoba"
	,"label - activity" : "Typ"
	,"label - date start" : "Początek"
	,"label - date end" : "Koniec"
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

	// form
	var msg = new sftJSmsg();
	msg.repositionMsgCenter();
	msg.styleWidth = 500;
	msg.showCancel = true;
	msg.autoOKClose = false;
	msg.createRegularForm = false;
	this.oMsg = msg;	
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
	nel.href = "javascript:oJobSchEd.startEditor()";
	nel.style.cssText = "float:right";
	nel.appendChild(document.createTextNode(this.lang["button label"]));
	elTB.appendChild(nel);
}

/* ------------------------------------------------------------------------ *\
	Init internal structures and show the main editor's window
\* ------------------------------------------------------------------------ */
oJobSchEd.startEditor = function()
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

	// tmp - add task window test
	this.showAddTaskWindow();
	// tmp
	/*
	strWikicode = this.buildWikicode();
	this.setContents(strWikicode);
	*/
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

// </nowiki>