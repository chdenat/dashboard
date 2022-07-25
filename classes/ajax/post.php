<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : get.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/26/22, 7:35 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
namespace dashboard\ajax;

require_once $_SERVER['DOCUMENT_ROOT'].'/config.php';
require_once DPATH . 'settings/loader.php';

AjaxManager::post( json_decode( file_get_contents( 'php://input' ), true, 512, ) );