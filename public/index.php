<?php
define('BASE_DIR', dirname(__DIR__));
define('APP_DIR', BASE_DIR . '/app');
try {
	/**
	 * Read the configuration
	 */
	$config = include APP_DIR.'/config/config.php';

	/**
	 * Read auto-loader
	 */
	include APP_DIR . '/config/loader.php';

	/**
	 * Read services
	 */
	include APP_DIR . '/config/services.php';

	// Handle the request
	$application = new \Phalcon\Mvc\Application($di);
	echo $application->handle()->getContent();
}
catch(\Phalcon\Exception $e)
{
	echo $e->getMessage();
}