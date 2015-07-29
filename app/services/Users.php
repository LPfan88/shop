<?php

namespace Shop\Services;

use Shop\Models\Users as UserModel;

class Users {

	/**
	 * Find or create user by session ID
	 *
	 * @return UserModel
	 */
	public static function findOrCreateUser()
	{
		$Session = \Phalcon\DI::getDefault()->getSession();
		if ($Session->has('id'))
		{
			return UserModel::findFirst($Session->get('id'));
		}

		$User = new UserModel();
		$User->save([
			'sess' => $Session->getId(),
		    'balance' => 0
		]);

		$Session->set('id', $User->id);

		return $User;
	}
}