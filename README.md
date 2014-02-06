JobSchEd
========

This extension provides a user interface for editing something you might call an activities calendar or a job schedule. Under the hood it uses [JSWikiGantt](https://github.com/Eccenux/JSWikiGantt) so you need it installed if you want to use this.

For more info please see:
https://www.mediawiki.org/wiki/Extension:JobSchEd

Installation
------------

1. Download the extension files and place them under <tt>extensions/JobSchEd</tt>
2. At the end of LocalSettings.php, add:
	`require_once("$IP/extensions/JobSchEd/JobSchEd.php");`
3. Installation can now be verified through <tt>Special:Version</tt> on your wiki