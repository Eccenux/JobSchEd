/*
-----------------------
THE LOADER CHECK:
-----------------------
*/
	// simple
	var z = ""+
		"djfhjshd // test"
	;
	// evil
	var x = /a"aa\/\/asa/ " \
	//\
	";
	var x = /aa\/*a*/;
	// a bit evil
	var x = /aa\/*a*/
	;
	
