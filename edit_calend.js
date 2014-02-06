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
	var tmp_VERSION = '0.0.4';  // = oJobSchEd.version = oJobSchEd.ver
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
	HTML form creator helper
	
	field = {type:'[input type]', lbl: '[field label]',
		name:'[field_name]', value:'[default value]'}
	optionally: jsUpdate:'someGlobalVariable = this.value'
	for text input: maxlen:[max str length]
	for checkbox: title on the left, label on the right
\* ------------------------------------------------------------------------ */
oJobSchEd.createForm = function(arrFields, strHeader)
{
	var strRet = ''
		+ '<h2>'+strHeader+'</h2>'
		+ '<div style="text-align:left; font-size:12px;" class="msgform">'
	;
	for (var i=0; i<arrFields.length; i++)
	{
		var oF = arrFields[i];
		if (typeof(oF.value)=='undefined')
		{
			oF.value = '';
		}
		switch (oF.type)
		{
			default:
			case 'text':
				var strExtra = '';
				strExtra += oF.jsUpdate ? ' onchange="'+oF.jsUpdate+'" ' : '';
				strExtra += oF.maxlen ? ' maxlength="'+oF.maxlen+'" ' : '';
				strExtra += oF.maxlen ? ' style="width:'+(oF.maxlen*8)+'px" ' : '';
				strRet += '<p>'
					+'<label style="display:inline-block;width:120px;text-align:right;">'+oF.lbl+':</label>'
					+' <input  type="'+oF.type+'" name="'+oF.name+'" value="'+oF.value+'" '+strExtra+' />'
					+'</p>'
				;
			break;
			case 'checkbox':
				var dt = new Date()
				var strInpId = oF.name+'_'+dt.getTime();
				var strExtra = '';
				strExtra += oF.jsUpdate ? ' onchange="'+oF.jsUpdate+'" ' : '';
				strExtra += oF.value ? ' checked="checked" ' : '';
				strRet += '<p>'
					+'<span style="display:inline-block;width:120px;text-align:right;">'+oF.title+':</span>'
					+' <input id="'+strInpId+'" type="'+oF.type+'" name="'+oF.name+'" value="1" '+strExtra+' />'
					+'<label for="'+strInpId+'">'+oF.lbl+':</label>'
					+'</p>'
				;
			break;
			case 'radio':
				var dt = new Date()
				var strInpId = oF.name+'_'+dt.getTime();
				var strExtra = '';
				strExtra += oF.jsUpdate ? ' onchange="'+oF.jsUpdate+'" ' : '';
				strRet += '<p>'
					+'<span style="display:inline-block;width:120px;text-align:right;">'+oF.title+':</span>'
				;
				for (var j=0; j<oF.lbls.length; j++)
				{
					var oFL = oF.lbls[j];
					var strSubInpId = strInpId+'_'+oFL.value;
					var strSubExtra = strExtra;
					strSubExtra += oF.value==oFL.value ? ' checked="checked" ' : '';
					strRet += ''
						+' <input id="'+strSubInpId+'" type="'+oF.type+'" name="'+oF.name+'" value="'+oFL.value+'" '+strSubExtra+' />'
						+'<label for="'+strSubInpId+'">'+oFL.lbl+'</label>'
					;
				}
				strRet += '</p>';
			break;
			case 'select':
				var dt = new Date()
				var strInpId = oF.name+'_'+dt.getTime();
				var strExtra = '';
				strExtra += oF.jsUpdate ? ' onchange="'+oF.jsUpdate+'" ' : '';
				strRet += '<p>'
					+'<span style="display:inline-block;width:120px;text-align:right;">'+oF.title+':</span>'
					+'<select name="'+oF.name+'" '+strExtra+'>'
				;
				for (var j=0; j<oF.lbls.length; j++)
				{
					var oFL = oF.lbls[j];
					var strSubInpId = strInpId+'_'+oFL.value;
					var strSubExtra ='';//= strExtra;
					strSubExtra += oF.value==oFL.value ? ' selected="selected" ' : '';
					strRet += ''
						+'<option value="'+oFL.value+'" '+strSubExtra+'>'+oFL.lbl+'</option>'
					;
				}
				strRet += '</select></p>';
			break;
		}
	}
	strRet += ''
		+ '</div>'
	;
	return strRet;
}

/* ------------------------------------------------------------------------ *\
	Show/build add task window
\* ------------------------------------------------------------------------ */
oJobSchEd.showAddTaskWindow = function()
{
	var msg = this.oMsg;
	
	// show form
	msg.repositionMsgCenter();
	this.oNewTask = new Object();
	
	// persons labels
	var oPersonLbls = new Array();
	for (var i=0; i<this.arrPersons.length; i++)
	{
		oPersonLbls[oPersonLbls.length] = {
			value	: this.arrPersons[i].intId,
			lbl		: this.arrPersons[i].strName
		};
	}
	// activities labels
	var oActivityLbls = new Array();
	for (var i=0; i<this.lang.activities.length; i++)
	{
		oActivityLbls[oActivityLbls.length] = {
			value	: i,
			lbl		: this.lang.activities[i].name
		};
	}
	// defaults
	this.oNewTask.intPersonId = oPersonLbls[0].value;
	this.oNewTask.intActivityId = oActivityLbls[0].value;
	var now = new Date();
	this.oNewTask.strDateStart = now.dateFormat(this.conf.strFormat);
	this.oNewTask.strDateEnd = now.dateFormat(this.conf.strFormat);
	// fields setup
	var arrFields = [
		{type:'select', title: this.lang['label - person'], lbls : oPersonLbls, value:this.oNewTask.intPersonId, jsUpdate:'oJobSchEd.oNewTask.intPersonId = this.value'},
		{type:'select', title: this.lang['label - activity'], lbls : oActivityLbls, value:this.oNewTask.intActivityId, jsUpdate:'oJobSchEd.oNewTask.intActivityId = this.value'},
		{type:'text', maxlen: 10, lbl: this.lang['label - date start'], value:this.oNewTask.strDateStart, jsUpdate:'oJobSchEd.oNewTask.strDateStart = this.value'},
		{type:'text', maxlen: 10, lbl: this.lang['label - date end'], value:this.oNewTask.strDateEnd, jsUpdate:'oJobSchEd.oNewTask.strDateEnd = this.value'}
	]
	var strHTML = this.createForm(arrFields, this.lang['form header - add']);
	msg.show(strHTML, 'oJobSchEd.submitAddTaskWindow()');
}

/* ------------------------------------------------------------------------ *\
	Submit add task window
	
	TODO: some validation of dates?
\* ------------------------------------------------------------------------ */
oJobSchEd.submitAddTaskWindow = function()
{
	// data parse
	this.oNewTask.intPersonId = parseInt(this.oNewTask.intPersonId);
	this.oNewTask.intActivityId = parseInt(this.oNewTask.intActivityId);
	var intP = this.indexOfPerson(this.oNewTask.intPersonId)
	if (intP!=-1)
	{
		this.oNewTask.strPersonName = this.arrPersons[intP].strName;
	}
	else
	{
		jsAlert(this.lang["gantt add error - unknown person"]);
		return;
	}
	/*
	this.oNewTask.strDateStart = this.oNewTask.strDateStart;
	this.oNewTask.strDateEnd = this.oNewTask.strDateEnd;
	*/

	// add task
	this.addTask (this.oNewTask);
	
	// build
	var strWikicode = this.buildWikicode();
	// output
	this.setContents(strWikicode);
	// close
	var msg = this.oMsg;
	msg.close();
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
		this.addTask (oTask);
		/*
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
		*/
	}
	return true;
}

/* ------------------------------------------------------------------------ *\
	Add task to the internal persons array
	
	oTask is the same as in .preParseTask()
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
	return strWikicode + "\n";
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