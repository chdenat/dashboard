<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : settings.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/28/22, 7:14 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
	
	namespace dashboard\user;
	
	use dashboard\user\UserManager;
	
	const PSWD_DB = [
		'type'    => UserManager::PSWD_TYPE_FILE,
		'file'    => AUTH_DIR . 'dbpsw.avm',
		'default' => AUTH_DIR . 'dbpsw-default.avm'
	];