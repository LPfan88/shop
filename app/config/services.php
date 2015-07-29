<?php

use Phalcon\DI\FactoryDefault,
	Phalcon\Mvc\View,
	Phalcon\Crypt,
	Phalcon\Mvc\Dispatcher,
	Phalcon\Mvc\Url as UrlResolver,
	Phalcon\Db\Adapter\Pdo\Mysql as DbAdapter;

use RussianToday\Auth\Auth,
	RussianToday\Acl\Acl;

/**
 * The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
 */
$di = new FactoryDefault();

/**
 * Loading routes from the routes.php file
 */
$di->set('router', function () {
	return require __DIR__ . '/routes.php';
});

/**
 * The URL component is used to generate all kind of urls in the application
 */
$di->set('url', function() use ($config) {
	$url = new UrlResolver();
	$url->setBaseUri($config->application->baseUri);
	return $url;
}, true);

// Setup the view component
$di->set('view', function() use($config){
	$view = new \Phalcon\Mvc\View();
	$view->setViewsDir($config->application->viewsDir);

	$view->registerEngines([
		'.phtml' => 'Phalcon\Mvc\View\Engine\Php' // Generate Template files uses PHP itself as the template engine
	]);

	return $view;
});
$di->set('dispatcher', function(){
	//Create/Get an EventManager
	$eventsManager = new Phalcon\Events\Manager();

	//Attach a listener
	$eventsManager->attach('dispatch', function($event, $dispatcher, $exception)
	{
		//The controller exists but the action not
		if ($event->getType() == 'beforeNotFoundAction')
		{
			echo 'Action not found';die;
			return FALSE;
		}

		//Alternative way, controller or action doesn't exists
		if ($event->getType() == 'beforeException')
		{
			switch ($exception->getCode())
			{
				case Phalcon\Dispatcher::EXCEPTION_HANDLER_NOT_FOUND:
				case Phalcon\Dispatcher::EXCEPTION_ACTION_NOT_FOUND:
					echo 'Handler not found';die;
				return FALSE;
			}
		}
	});

	$dispatcher = new Phalcon\Mvc\Dispatcher();
	$dispatcher->setEventsManager($eventsManager);
	$dispatcher->setDefaultNamespace('Shop\Controllers');
	return $dispatcher;
});
/**
 * Database connection is created based in the parameters defined in the configuration file
 */
$di->set('db', function() use ($config) {
	$db =  new DbAdapter([
		'host' => $config->database->host,
		'username' => $config->database->username,
		'password' => $config->database->password,
		'dbname' => $config->database->dbname,
		'charset' => $config->database->charset
	]);
	return $db;
});

/**
* We need sessions to save user id
 */
$di->setShared('session', function() {
	$session = new Phalcon\Session\Adapter\Files();
	$session->start();
	return $session;
});