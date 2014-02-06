<?php
/**
	Simple JS loader
*/
class ecSimpleJSLoader
{
	var $noCache = false;					// always generate scripts from scratch
	var $wgOut;
	var $strBaseScriptDir;						// base path for modules and generated scripts
	var $strBaseModulesName = 'edit_calend_';	// prefix for modules loaded in loadModules
	var $strMiniModulesElId = 'JobSchEdJSmini';	// element id for a script generated in loadModules
	var $strMiniModulesName = 'edit_calend.modules.mini.js';	// file name for a script generated in loadModules
	// minification options
	var $isRemoveInlineComments = true;
	var $isRemoveMultiComments = true;

	function __construct($wgOut, $strBaseScriptDir)
	{
		$this->wgOut = $wgOut;
		$this->strBaseScriptDir = $strBaseScriptDir;
	}

	/*
		Load an array of JS modules.
		
		$arrModules should contain names of files without the prefix and an extension
	*/
	function loadModules($arrModules)
	{
		$strOutputPath = "{$this->strBaseScriptDir}/{$this->strMiniModulesName}";
		
		// check if we need to change anything
		if (!$this->noCache)
		{
			$intMaxTime = 0;
			if (file_exists($strOutputPath))
			{
				foreach ($arrModules as $m)
				{
					$intTmpTime = filemtime($this->getModulePath($m));
					if ($intTmpTime>$intMaxTime)
					{
						$intMaxTime = $intTmpTime;
					}
				}
				$intFileTime = filemtime($strOutputPath);
			}
			else
			{
				$intFileTime = $intMaxTime-1;	// always create
			}
		}
		
		if ($this->noCache || $intFileTime<$intMaxTime)
		{
			// generate & create file
			$strCode = '';
			foreach ($arrModules as $m)
			{
				$strCode .= $this->getMiniContents($this->getModulePath($m));
				$strCode .= "\n";
			}
			file_put_contents($strOutputPath, $strCode);
		}
		
		// TODO: return file name and move this outside of this function
		$this->wgOut->addHeadItem($this->strMiniModulesElId, Html::linkedScript(efJobSchEdgetCSSJSLink($this->strMiniModulesName)));
	}
	
	/*
		Get module path
	*/
	function getModulePath($strModuleName)
	{
		return "{$this->strBaseScriptDir}/{$this->strBaseModulesName}$strModuleName.js";
	}

	/*
		Gets minified contents of the given file
	*/
	function getMiniContents($strFilePath)
	{
		// contents
		$strCode = file_get_contents($strFilePath);
		
		// BOM del
		$strCode = preg_replace('#^\xEF\xBB\xBF#', '', $strCode);
		
		// lines (simpli/uni)fication
		$strCode = preg_replace(array("#\r\n#", "#\r#"), "\n", $strCode);
		
		// remove in-line comments without removing any horizontal whitespace
		if ($this->isRemoveInlineComments)
		{
			$strCode = preg_replace("#[ \t]*\//[^\"\n]*[^\\\"\n](?=\n)#", '', $strCode);
		}
		
		// remove vertical whitespace from EOL
		$strCode = preg_replace("#[ \t]+\n#", "\n", $strCode);
		
		// remove multi-line comments, add in-line comment in format: "// EOC@line#X".
		if ($this->isRemoveMultiComments)
		{
			$strCode = $this->parseMultiCom($strCode);
		}
		
		// TODO: Move this outside of this function
		// add an in-line comment with the original file name
		$strFileName = basename($strFilePath);
		$strCode = "\n// $strFileName, line#0\n$strCode\n// $strFileName, EOF";
		return $strCode;
	}

	/*
		Parse multiline comments
	*/
	function parseMultiCom($strCode)
	{
		// prepare for simplified search
		//$strCode = "\n".$strCode."\n";
		
		//
		// find comments
		$arrComments = array();
		$reMulti = "#(?:^|\n)\s*/\*[\s\S]+?\*/\s*(?=\n|$)#";
		if (preg_match_all($reMulti, $strCode, $arrMatches, PREG_OFFSET_CAPTURE))
		{
			foreach ($arrMatches[0] as $m)
			{
				$intInd = count($arrComments);
				$arrComments[$intInd] = array('start'=>$m[1], 'len'=>strlen($m[0]));
				if ($intInd>0)
				{
					$arrComments[$intInd]['previous'] = $arrComments[$intInd-1]['start']+$arrComments[$intInd-1]['len'];
				}
				else
				{
					$arrComments[$intInd]['previous'] = 0;
				}
			}
		}
		
		//
		// replace comments
		$intCorrection = 0;
		$intLines = 0;
		foreach ($arrComments as $c)
		{
			$intLines += 1+preg_match_all("#\n#"
				, substr($strCode
					, $c['previous']-$intCorrection
					, ($c['start']-$c['previous'])+$c['len'])
				, $m);
			$intLenPre = strlen($strCode);
			$strCode = substr_replace($strCode, "\n// EOC@line#{$intLines}", $c['start']-$intCorrection, $c['len']);
			$intLines--;	// correction as line at the end is not matched
			$intCorrection += $intLenPre-strlen($strCode);
		}
		
		return $strCode;
	}
}

?>