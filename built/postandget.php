<?php
header("Content-type: text/plain;charset=UTF-8");
$url = $_POST['url'];
echo(loadURL($url));

function loadURL($urlToFetch){

	        $ch = curl_init($urlToFetch);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;

}

?>