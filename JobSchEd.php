<?php
/**
	JobSchEd - Job Schedule Edit

	Needed external modules:
	* JSWikiGantt ver. 0.3.0 or higher
	* sftJSmsg ver 0.3.0 or higher
 
	Description:
	-
 
    Copyright:  ©2010 Maciej Jaros (pl:User:Nux, en:User:EcceNux)
 
	To activate this extension, add the following into your LocalSettings.php file:
	require_once("$IP/extensions/JobSchEd/JobSchEd.php");
	
	@ingroup Extensions
	@author Maciej Jaros <egil@wp.pl>
	@license http://www.gnu.org/copyleft/gpl.html GNU General Public License 2.0 or later
*/
 
/**
 * Protect against register_globals vulnerabilities.
 * This line must be present before any global variable is referenced.
 */
if( !defined( 'MEDIAWIKI' ) ) {
	echo( "This is an extension to the MediaWiki package and cannot be run standalone.\n" );
	die( -1 );
}

//
// Extension credits that will show up on Special:Version
//
$wgExtensionCredits['parserhook'][] = array(
	'path'         => __FILE__,
	'name'         => 'JobSchEd',
	'version'      => '0.0.3',
	'author'       => 'Maciej Jaros', 
	'url'          => 'http://www.mediawiki.org/wiki/Extension:JobSchEd',
	'description'  => ''
		." This extension edits ''jsgantt'' tag contents to create specific diagrams of urlopy and stuff :-)."
);

//
// Absolute path
//
$wgJobSchEdDir = rtrim(dirname(__FILE__), "/\ ");
$wgJobSchEdScriptDir = "{$wgScriptPath}/extensions/JobSchEd";

//
// Configuration file
//
//require_once ("{$wgJobSchEdDir}/JobSchEd.config.php");

//
// Class setup
//
//$wgAutoloadClasses['ecJobSchEd'] = "{$wgJobSchEdDir}/JobSchEd.body.php";

//
// add hook setup and init class/object
//
$wgHooks['BeforePageDisplay'][] = 'efJobSchEdSetup';
function efJobSchEdSetup($wgOut)
{
	$wgOut->addHeadItem('JobSchEdJS' , Html::linkedScript( efJobSchEdgetCSSJSLink("edit_calend.js") ) );
	$wgOut->addHeadItem('jsganttDateJS' , Html::linkedScript( efJobSchEdgetCSSJSLink("date-functions.js") ) );
	return true;
}

$wgJobSchEdtScriptVersion = 1;
function efJobSchEdgetCSSJSLink($strFileName)
{
	global $wgJobSchEdtScriptVersion, $wgJobSchEdScriptDir;
	
	return "{$wgJobSchEdScriptDir}/{$strFileName}?{$wgJobSchEdtScriptVersion}";
}
