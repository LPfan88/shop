<?php

$router = new Phalcon\Mvc\Router();

$router->removeExtraSlashes(TRUE);

$router->add('/', array(
	'namespace' => 'Shop\Controllers',
	'controller' => 'Index'
));

return $router;