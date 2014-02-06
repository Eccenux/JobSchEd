
// edit_calend__core.js, line#0
// <nowiki>
// EOC@line#15
//  wersja:
	var tmp_VERSION = '0.6.0';  // = oJobSchEd.version = oJobSchEd.ver
// ------------------------------------------------------------------------ //
// EOC@line#22
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
// EOC@line#70
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
// EOC@line#126
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
// EOC@line#144
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
// EOC@line#167
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
// EOC@line#183
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
// EOC@line#202
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
// EOC@line#226
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
// EOC@line#246
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
// EOC@line#266
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
// EOC@line#282
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
// EOC@line#298
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
// EOC@line#316
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
// edit_calend__core.js, EOF

// edit_calend_form_cr.js, line#0

// EOC@line#6
// EOC@line#15
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
		if (typeof(oF.name)=='undefined')
		{
			var now = new Date();
			oF.name = 'undefined_'+now.getTime();
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
// edit_calend_form_cr.js, EOF

// edit_calend_parsing.js, line#0

// EOC@line#4
// EOC@line#7
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
// EOC@line#30
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
	}
	return true;
}
// EOC@line#62
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
// edit_calend_parsing.js, EOF

// edit_calend_wikicodebuilder.js, line#0

// EOC@line#4
// EOC@line#7
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
// EOC@line#21
oJobSchEd.setContents = function(strWikicode)
{
	var el = this.elEditArea;
	el.value = el.value.replace(this.conf.reGantMatch, "$1"+strWikicode+"$3");
}
// EOC@line#30
oJobSchEd.buildWikicode = function()
{
	var strWikicode = '';
	for (var i=0; i<this.arrPersons.length; i++)
	{
		for (var j=0; j<this.arrPersons[i].arrActivities.length; j++)
		{
			if (typeof(this.arrPersons[i].arrActivities[j])=='undefined')	// might be empty after del
			{
				continue;
			}
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
// EOC@line#72
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
// edit_calend_wikicodebuilder.js, EOF

// edit_calend_msgs_mod_p.js, line#0

// EOC@line#4
oJobSchEd.oModPerson = new Object();
// EOC@line#9
oJobSchEd.oModPerson.showAdd = function()
{
	// get/build activities and persons lables
	//this.buildLabels();
	
	// defaults
	this.oParent.oNewPerson = {
		strPersonName : ''
	};

	// fields setup
	var arrFields = this.getArrFields('oJobSchEd.oNewPerson');
	var strHTML = this.oParent.createForm(arrFields, this.oParent.lang['header - add']);

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModPerson.submitAdd()');
	msg.repositionMsgCenter();
}
// EOC@line#34
oJobSchEd.oModPerson.submitAdd = function()
{
	// add person
	this.oParent.addPerson (this.oParent.oNewPerson.strPersonName);
	
	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#46
oJobSchEd.oModPerson.showEdit = function(intPersonId)
{
	// defaults
	var intPer = this.oParent.indexOfPerson(intPersonId);
	this.oParent.oNewPerson = {
		strPersonName : this.oParent.arrPersons[intPer].strName
	};

	// fields setup
	var arrFields = this.getArrFields('oJobSchEd.oNewPerson');
	var strHTML = this.oParent.createForm(arrFields, this.oParent.lang['header - edit']);

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModPerson.submitEdit('+intPersonId+')');
	msg.repositionMsgCenter();
}
// EOC@line#69
oJobSchEd.oModPerson.submitEdit = function(intPersonId)
{
	// add person
	this.oParent.setPerson (this.oParent.oNewPerson.strPersonName, intPersonId);

	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#81
oJobSchEd.oModPerson.showDel = function(intPersonId)
{
	// defaults
	var intPer = this.oParent.indexOfPerson(intPersonId);

	// fields setup
	var strHTML = "<h2>"+this.oParent.lang['header - del']+"</h2>"
		+ this.oParent.arrPersons[intPer].strName;

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModPerson.submitDel('+intPersonId+')');
	msg.repositionMsgCenter();
}
// EOC@line#99
oJobSchEd.oModPerson.submitDel = function(intPersonId)
{
	// add person
	this.oParent.delPerson (intPersonId);

	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#138
oJobSchEd.oModPerson.getArrFields = function(strNewPersonObject)
{
	return [
		{type:'text', maxlen: 10, lbl: this.oParent.lang['label - person']
			, value:this.oParent.oNewPerson.strPersonName
			, jsUpdate:strNewPersonObject+'.strPersonName = this.value'}
	];
}
// EOC@line#150
oJobSchEd.oModPerson.submitCommon = function()
{
	// build
	var strWikicode = this.oParent.buildWikicode();
	// output
	this.oParent.setContents(strWikicode);
	// close
	this.oMsg.close();
	
	// refresh window
	this.oParent.oListPersons.refresh();
}
// edit_calend_msgs_mod_p.js, EOF

// edit_calend_msgs_mod_t.js, line#0

// EOC@line#4
oJobSchEd.oModTask = new Object();
// EOC@line#9
oJobSchEd.oModTask.showAdd = function(intPersonId)
{
	// get/build activities and persons lables
	this.buildLabels();
	
	// defaults
	var now = new Date();
	this.oParent.oNewTask = {
		intPersonId : (typeof(intPersonId)=='undefined' ? this.arrPersonLbls[0].value : intPersonId),
		intActivityId : this.arrActivityLbls[0].value,
		strDateStart : now.dateFormat(this.oParent.conf.strFormat),
		strDateEnd : now.dateFormat(this.oParent.conf.strFormat)
	};

	// fields setup
	var arrFields = this.getArrFields('oJobSchEd.oNewTask');
	var strHTML = this.oParent.createForm(arrFields, this.oParent.lang['header - add']);

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModTask.submitAdd()');
	msg.repositionMsgCenter();
}
// EOC@line#38
oJobSchEd.oModTask.submitAdd = function()
{
	// data parse
	this.oParent.oNewTask.intPersonId = parseInt(this.oParent.oNewTask.intPersonId);
	this.oParent.oNewTask.intActivityId = parseInt(this.oParent.oNewTask.intActivityId);
	var intP = this.oParent.indexOfPerson(this.oParent.oNewTask.intPersonId)
	if (intP!=-1)
	{
		this.oParent.oNewTask.strPersonName = this.oParent.arrPersons[intP].strName;
	}
	else
	{
		jsAlert(this.oParent.lang["gantt add error - unknown person"]);
		return;
	}

	// add task
	this.oParent.addTask (this.oParent.oNewTask);
	
	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#64
oJobSchEd.oModTask.showEdit = function(intPersonId, intActIndex)
{
	// get/build activities and persons lables
	this.buildLabels();
	
	// defaults
	var intPer = this.oParent.indexOfPerson(intPersonId);
	var oA = this.oParent.arrPersons[intPer].arrActivities[intActIndex];
	this.oParent.oNewTask = {
		intPersonId : intPersonId,
		intActivityId : oA.intId,
		strDateStart : oA.strDateStart,
		strDateEnd : oA.strDateEnd
	};

	// fields setup
	var arrFields = this.getArrFields('oJobSchEd.oNewTask');
	var strHTML = this.oParent.createForm(arrFields, this.oParent.lang['header - edit']);

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModTask.submitEdit('+intPersonId+', '+intActIndex+')');
	msg.repositionMsgCenter();
}
// EOC@line#94
oJobSchEd.oModTask.submitEdit = function(intPersonId, intActIndex)
{
	var oNewTask = this.oParent.oNewTask;
	// data parse
	oNewTask.intPersonId = parseInt(oNewTask.intPersonId);
	oNewTask.intActivityId = parseInt(oNewTask.intActivityId);
	var intP = this.oParent.indexOfPerson(oNewTask.intPersonId)
	if (intP!=-1)
	{
		oNewTask.strPersonName = this.oParent.arrPersons[intP].strName;
	}
	else
	{
		jsAlert(this.oParent.lang["gantt add error - unknown person"]);
		return;
	}

	// person not changed? => simply change act.
	if (intPersonId==oNewTask.intPersonId)
	{
		this.oParent.setTask (oNewTask, intPersonId, intActIndex);
	}
	// => remove act. from the previous person and add a new one
	else
	{
		this.oParent.delTask (intPersonId, intActIndex);
		this.oParent.addTask (oNewTask);
	}
	
	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#130
oJobSchEd.oModTask.showDel = function(intPersonId, intActIndex)
{
	// defaults
	var intPer = this.oParent.indexOfPerson(intPersonId);
	var oA = this.oParent.arrPersons[intPer].arrActivities[intActIndex];

	// fields setup
	var strHTML = "<h2>"+this.oParent.lang['header - del']+"</h2>"
		+oA.strDateStart+" - "+oA.strDateEnd
		+": "+this.oParent.lang.activities[oA.intId].name
	;

	// show form
	var msg = this.oMsg;
	msg.show(strHTML, 'oJobSchEd.oModTask.submitDel('+intPersonId+', '+intActIndex+')');
	msg.repositionMsgCenter();
}
// EOC@line#151
oJobSchEd.oModTask.submitDel = function(intPersonId, intActIndex)
{
	// add person
	this.oParent.delTask (intPersonId, intActIndex);

	// common stuff (rebuild, refresh...)
	this.submitCommon();
}
// EOC@line#163
oJobSchEd.oModTask.buildLabels = function()
{
	// persons labels
	this.arrPersonLbls = new Array();
	for (var i=0; i<this.oParent.arrPersons.length; i++)
	{
		this.arrPersonLbls[this.arrPersonLbls.length] = {
			value	: this.oParent.arrPersons[i].intId,
			lbl		: this.oParent.arrPersons[i].strName
		};
	}
	// activities labels
	this.arrActivityLbls = new Array();
	for (var i=0; i<this.oParent.lang.activities.length; i++)
	{
		this.arrActivityLbls[this.arrActivityLbls.length] = {
			value	: i,
			lbl		: this.oParent.lang.activities[i].name
		};
	}
}
// EOC@line#190
oJobSchEd.oModTask.getArrFields = function(strNewTaskObject)
{
	return [
		{type:'select', title: this.oParent.lang['label - person']
			, lbls : this.arrPersonLbls
			, value:this.oParent.oNewTask.intPersonId
			, jsUpdate:strNewTaskObject+'.intPersonId = this.value'},
		{type:'select', title: this.oParent.lang['label - activity']
			, lbls : this.arrActivityLbls
			, value:this.oParent.oNewTask.intActivityId
			, jsUpdate:strNewTaskObject+'.intActivityId = this.value'},
		{type:'text', maxlen: 10, lbl: this.oParent.lang['label - date start']
			, value:this.oParent.oNewTask.strDateStart
			, jsUpdate:strNewTaskObject+'.strDateStart = this.value'},
		{type:'text', maxlen: 10, lbl: this.oParent.lang['label - date end']
			, value:this.oParent.oNewTask.strDateEnd
			, jsUpdate:strNewTaskObject+'.strDateEnd = this.value'}
	];
}
// EOC@line#213
oJobSchEd.oModTask.submitCommon = function()
{
	// build
	var strWikicode = this.oParent.buildWikicode();
	// output
	this.oParent.setContents(strWikicode);
	// close
	this.oMsg.close();
	
	// refresh window<del>s</del>
	//this.oParent.oListPersons.refresh();
	this.oParent.oListAct.refresh();
}
// edit_calend_msgs_mod_t.js, EOF

// edit_calend_msgs_list_p.js, line#0

// EOC@line#4
oJobSchEd.oListPersons = new Object();
// EOC@line#9
oJobSchEd.oListPersons.show = function()
{
	// persons list
	var strList = '<h2>'+this.oParent.lang["header - persons"]+'</h2>';
	strList += '<ul style="text-align:left">';
	for (var i=0; i<this.oParent.arrPersons.length; i++)
	{
		var oP = this.oParent.arrPersons[i];
		strList += ''
			+'<li>'
				+'<a href="javascript:oJobSchEd.oListAct.show('+oP.intId.toString()+')">'
					+oP.strName
					+' '
					+'<img src="'+this.oParent.conf['img - list']+'" alt=" " />'
				+'</a>'
				+' '
				+'<a href="javascript:oJobSchEd.oModPerson.showEdit('+oP.intId.toString()+')">'
					+'<img src="'+this.oParent.conf['img - edit']+'" alt="'
						+this.oParent.lang['alt - mod']
					+'" />'
				+'</a>'
				+' '
				+'<a href="javascript:oJobSchEd.oModPerson.showDel('+oP.intId.toString()+')">'
					+'<img src="'+this.oParent.conf['img - del']+'" alt="'
						+this.oParent.lang['alt - del']
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

	// show form
	var msg = this.oMsg;
	msg.show(strList);
	msg.repositionMsgCenter();
}
// EOC@line#57
oJobSchEd.oListPersons.refresh = function()
{
	// close previous
	this.oMsg.close();

	// show again
	this.show();
}
// edit_calend_msgs_list_p.js, EOF

// edit_calend_msgs_list_t.js, line#0

// EOC@line#4
oJobSchEd.oListAct = new Object();
// EOC@line#9
oJobSchEd.oListAct.show = function(intPersonId)
{
	// remeber last (for refresh)
	if (typeof(intPersonId)=='undefined')
	{
		intPersonId = this.intLastPersonId;
	}
	this.intLastPersonId = intPersonId;
	
	// tasks list
	var i = this.oParent.indexOfPerson(intPersonId);
	// unexpected error (person should be known)
	if (i<0)
	{
		return;
	}
	var oP = this.oParent.arrPersons[i];
	var strList = '<h2>'+oP.strName+'</h2>';
	strList += '<ul style="text-align:left">';
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
					+' '
					+'<img src="'+this.oParent.conf['img - edit']+'" alt=" " />'
				+'</a>'
				+' '
				+'<a href="javascript:oJobSchEd.oModTask.showDel('+oP.intId.toString()+', '+j.toString()+')">'
					+'<img src="'+this.oParent.conf['img - del']+'" alt="'
						+this.oParent.lang['alt - del']
					+'" />'
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

	// show form
	var msg = this.oMsg;
	msg.show(strList);
	msg.repositionMsgCenter();
}
// EOC@line#70
oJobSchEd.oListAct.refresh = function()
{
	// close previous
	this.oMsg.close();

	// show again
	this.show();
}
// edit_calend_msgs_list_t.js, EOF
