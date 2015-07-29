<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerNamespaces(array(
	'Shop\Controllers' => APP_DIR . '/controllers/',
	'Shop\Models' => APP_DIR . '/models/',
	'Shop\Services' => APP_DIR . '/services/',
))->register();