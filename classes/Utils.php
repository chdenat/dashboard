<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : Utils.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/18/22, 11:20 AM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard;
	
	class Utils {
		
		// From WordPress
		public static function parse_args( $args, $defaults = [] )
		: array {
			$parsed_args = [];
			if ( is_object( $args ) ) {
				$parsed_args = get_object_vars( $args );
			} elseif ( is_array( $args ) ) {
				$parsed_args =& $args;
			}
			
			if ( is_array( $defaults ) && $defaults ) {
				return array_merge( $defaults, $parsed_args );
			}
			
			return $parsed_args;
		}
		
	}