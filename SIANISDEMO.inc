<?php

// Demo of Sidora Analysis API for Islandora
// file: SIANISDEMO.inc
// author: Gert Schmeltz Pedersen gertsp45@gmail.com

class SIANISDEMO {

  function SIANISDEMO() {
  }

  function sianisdemoGetFile($file='') {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianisdemo-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name / sianisdemoGetFile / $file");
	$filePath = drupal_get_path('module', 'sianisdemo') . '/' . $file;
		fwrite($logfp, "\n\n[$datestamp] $user->name / sianisdemoGetFile / $filePath");
	$fp = fopen($filePath, 'r') or exit("Unable to open file!");
	while(!feof($fp)) {
		$line = fgets($fp);
		print $line;
			fwrite($logfp, $line);
	}
		fclose($logfp);
	fclose($fp);
	module_invoke_all('exit');
	exit();
  }

  function sianisdemoGetProjectStructure() {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianisdemo-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianisdemoGetProjectStructure");
    $sianisUrl = variable_get('sianisdemo_block_sianis', 'noSianisUrl');
    $sianisUserPass = variable_get('sianisdemo_block_sianis_userpass', 'noSianisdemoUserOfSianis:Pass');
	$params = 'sianisProjectStructureToHtml.xslt';
	$command = 'curl --silent -u '. $sianisUserPass . ' "' . $sianisUrl . '/sianisGetProjectStructure/' . $params . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] $user->name command: $command");
	$curlResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
//		fwrite($logfp, "\n[$datestamp] $user->name curlResult: $curlResult");
	    $sianisdemoGetProjectStructureCount = substr_count($curlResult, 'sianisdemoObstableClicked');
		if ($sianisdemoGetProjectStructureCount == 0) {
			$sianisdemoGetProjectStructureCount = 'ERROR';
		}
		fwrite($logfp, "\n[$datestamp] $user->name sianisdemoGetProjectStructureCount: $sianisdemoGetProjectStructureCount observation tables");
		fclose($logfp);
	print $curlResult;
	module_invoke_all('exit');
	exit();
  }

  function sianisdemoGetSpecies($obstablePids) {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianisdemo-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianisdemoGetSpecies: obstablePids= $obstablePids");
    $sianisUrl = variable_get('sianisdemo_block_sianis', 'noSianisUrl');
    $sianisUserPass = variable_get('sianisdemo_block_sianis_userpass', 'noSianisdemoUserOfSianis:Pass');
	$command = 'curl --silent -u '. $sianisUserPass . ' "' . $sianisUrl . '/sianisGetSpecies/' . str_replace(' ', '+', $obstablePids) . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] $user->name command: $command");
	$curlResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
	 	$logString = substr($curlResult,0,500);
		fwrite($logfp, "\n[$datestamp] $user->name curlResult: $logString");
		fclose($logfp);
	print $curlResult;
	module_invoke_all('exit');
	exit();
  }

  function sianisdemoSelectObstables($south='-90', $west='-180', $north='90', $east='180', $beginDateFrom='20000101', $beginDateTo='20991231', $endDateFrom='20000101', $endDateTo='20991231') {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianisdemo-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianisdemoSelectObstables: ( $south , $west ),( $north , $east )  [Ê$beginDateFrom - $beginDateTo ],[ $endDateFrom - $endDateTo ]");
    $sianisUrl = variable_get('sianisdemo_block_sianis', 'noSianisUrl');
    $sianisUserPass = variable_get('sianisdemo_block_sianis_userpass', 'noSianisdemoUserOfSianis:Pass');
	$params = $south . '/' . $west . '/' . $north . '/' . $east . '/' . $beginDateFrom . '/' . $beginDateTo . '/' . $endDateFrom . '/' . $endDateTo . '/sianisObstablesToHtml.xslt';
	$command = 'curl --silent -u '. $sianisUserPass . ' "' . $sianisUrl . '/sianisSelectObstables/' . $params . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] $user->name command: $command");
	$curlResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
	 	$logString = substr($curlResult,0,600);
		fwrite($logfp, "\n[$datestamp] $user->name curlResult: $logString");
		fclose($logfp);
	print $curlResult;
	module_invoke_all('exit');
	exit();
  }
}

?>
