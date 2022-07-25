<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : DSBException.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/30/22, 4:26 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

namespace dashboard;
	
	class DSBException extends \Exception {
		public function __construct($message, $code = 0, Throwable $previous = null) {
			// make sure everything is assigned properly
			parent::__construct($message, $code, $previous);
		}
		
		// custom string representation of object
		public function __toString() {
			return __CLASS__ . ": [{$this->code}]: {$this->message}\n";
		}
		
	}