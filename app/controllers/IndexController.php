<?php

namespace Shop\Controllers;

use Phalcon\Mvc\View,
	Phalcon\Mvc\Controller,
	Shop\Models\Items,
	Shop\Services\Users;

class IndexController extends Controller{
	public function indexAction()
	{
		$this->view->User = Users::findOrCreateUser();
		$this->view->items = Items::find('isPublic = 1');
	}
}