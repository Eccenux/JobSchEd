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
	var tmp_VERSION = '0.6.3';  // = oJobSchEd.version = oJobSchEd.ver
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
	,"img - edit" : 'extensions/JobSchEd/img/edit.png'
	,"img - list" : 'extensions/JobSchEd/img/list.png'
	,"img - del" : 'extensions/JobSchEd/img/del.png'
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
	,"header - add" : "Dodaj wpis"
	,"header - edit" : "Edytuj wpis"
	,"header - persons" : "Wybierz osobę"
	,"header - del" : "Czy na pewno chcesz usunąć?"
	,"label - person" : "Osoba"
	,"label - activity" : "Typ"
	,"label - date start" : "Początek"
	,"label - date end" : "Koniec"
	,"label - new activity" : "dodaj wpis"
	,"label - new person" : "dodaj osobę"
	,"alt - mod" : "Zmień"
	,"alt - del" : "Usuń"
	,"close button label" : "Zamknij"
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

	// task form
	var msg = new sftJSmsg();
	msg.repositionMsgCenter();
	msg.styleWidth = 500;
	msg.styleZbase += 30;
	msg.showCancel = true;
	msg.autoOKClose = false;
	msg.createRegularForm = false;
	this.oModTask.oMsg = msg;
	this.oModTask.oParent = this;

	// person form
	var msg = new sftJSmsg();
	msg.repositionMsgCenter();
	msg.styleWidth = 500;
	msg.styleZbase += 30;
	msg.showCancel = true;
	msg.autoOKClose = false;
	msg.createRegularForm = false;
	this.oModPerson.oMsg = msg;
	this.oModPerson.oParent = this;

	// persons list
	var msg = new sftJSmsg();
	msg.repositionMsgCenter();
	msg.styleWidth = 300;
	msg.styleZbase += 10;
	msg.showCancel = false;
	msg.lang['OK'] = this.lang["close button label"];
	msg.createRegularForm = false;
	this.oListPersons.oMsg = msg;
	this.oListPersons.oParent = this;

	// tasks of a person list
	var msg = new sftJSmsg();
	msg.repositionMsgCenter();
	msg.styleWidth = 500;
	msg.styleZbase += 20;
	msg.showCancel = false;
	msg.lang['OK'] = this.lang["close button label"];
	msg.createRegularForm = false;
	this.oListAct.oMsg = msg;
	this.oListAct.oParent = this;
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
	// read wiki code
	var strWikicode = this.getContents();
	if (strWikicode===false)
	{
		jsAlert(this.lang["gantt not found"])
	}
	// parse code to internal structures
	if (!this.parse(strWikicode))	// on errors messages are displayed inside parse()
	{
		return;
	}

	// main editor's window - list persons
	this.oListPersons.show();
}

/* ------------------------------------------------------------------------ *\
	Find person in the this.arrPersons array
	
	index when found, -1 if not found
\* ------------------------------------------------------------------------ */
oJobSchEd.indexOfPerson = function(intPersonId)
{
	for (var i=0; i<this.arrPersons.length; i++)
	{
		if (this.arrPersons[i] && this.arrPersons[i].intId==intPersonId)
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
	Add task to the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.addTask = function(oTask)
{
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

/* ------------------------------------------------------------------------ *\
	Add person to the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.addPerson = function(strPersonName)
{
	var intPer = this.arrPersons.length;
	// new id
	var intPersonId = this.arrPersons[intPer-1].intId + 10;
	while (this.indexOfPerson (intPersonId)!=-1)
	{
		intPersonId+=10;
	}
	// add
	this.arrPersons[intPer] = {
		intId : intPersonId,
		strName : strPersonName,
		arrActivities : new Array()
	}
}

/* ------------------------------------------------------------------------ *\
	Change task in the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.setTask = function(oTask, intPersonId, intActIndex)
{
	var intPer = this.indexOfPerson (intPersonId);
	// person not found?
	if (intPer==-1)
	{
		return false;
	}
	// change activity
	this.arrPersons[intPer].arrActivities[intActIndex] = {
		strDateStart : oTask.strDateStart,
		strDateEnd : oTask.strDateEnd,
		intId : oTask.intActivityId
	}
	return true;
}

/* ------------------------------------------------------------------------ *\
	Change person in the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.setPerson = function(strPersonName, intPersonId)
{
	var intPer = this.indexOfPerson (intPersonId);
	// person not found?
	if (intPer==-1)
	{
		return false;
	}
	// change person
	this.arrPersons[intPer].strName = strPersonName;
	return true;
}

/* ------------------------------------------------------------------------ *\
	Remove task from the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.delTask = function(intPersonId, intActIndex)
{
	var intPer = this.indexOfPerson (intPersonId);
	// person not found?
	if (intPer==-1)
	{
		return false;
	}
	// remove activity
	this.arrPersons[intPer].arrActivities[intActIndex] = undefined;
	return true;
}

/* ------------------------------------------------------------------------ *\
	Remove person from the internal persons array
\* ------------------------------------------------------------------------ */
oJobSchEd.delPerson = function(intPersonId)
{
	var intPer = this.indexOfPerson (intPersonId);
	// person not found?
	if (intPer==-1)
	{
		return false;
	}
	// remove
	this.arrPersons[intPer] = undefined;
	// reindex to remove undefines
	this.arrPersons.myReIndexArray()
	return true;
}

/* ------------------------------------------------------------------------ *\
	Reindex array with undefined values
\* ------------------------------------------------------------------------ */
Array.prototype.myReIndexArray = function()
{
	for (var i=0; i<this.length; i++)
	{
		if (this[i]==undefined)
		{
			// search for defined...
			for (var j=i; j<this.length; j++)
			{
				if (this[j]==undefined)
				{
					continue;
				}
				this[i]=this[j];
				this[j]=undefined;
				break;
			}
		}
	}
	// fix length
	while (this.length > 0 && this[this.length-1] == undefined)
	{
		this.length--;
	}
}

// </nowiki>