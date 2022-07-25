<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : Debug.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/18/22, 11:20 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

namespace dashboard;

	class Debug {
		public static function print( $to_debug, $text = '' ) {
			
			// Bail early if no debug
			if ( ! self::is_debug_on() ) {
				return;
			}
			global $debug_log_array; // 1 = print_r, 2=var_dump;
			
			if ( ! $debug_log_array ) {
				$debug_log_array = 1;
			}
			
			// Get caller file and line
			$backtrace = debug_backtrace();
			
			$file_info = '';
			if ( is_array( $backtrace[0] ) ) {
				$file_info = $backtrace[0]['file'] . ":" . $backtrace[0]['line'];
			}
			// Print content
			$text = strtoupper( $text );
			$msg  = "==== DEBUG $text > $file_info";
			
			error_log( $msg );
			
			if ( is_array( $to_debug ) || is_object( $to_debug ) ) {
				ob_start();
				if ( $debug_log_array === 2 ) {
					var_dump( $to_debug );
				} else {
					print_r( $to_debug );
					
				}
                error_log(ob_get_clean());
			} elseif ( null === $to_debug ) {
				error_log( ' >>> VALEUR NULL' );
			} elseif ( is_string( $to_debug ) && '' === $to_debug ) {
				error_log( ' >>> CHAINE VIDE' );
			} elseif ( ( ! is_int( $to_debug ) || ! is_bool( $to_debug ) ) && ( empty( $to_debug ) ) ) {
				error_log( ' >>> PAS DE DONNEES' );
			} else {
				error_log( $to_debug );
			}
			error_log( '======================' );
			error_log( '' );
			
		}
		
		public static function is_debug_on() {
			return \DEBUG;
		}
		
		public static function echo( $to_debug, $text = '' ) {
			
			// Bail early if no debug
			if ( ! self::is_debug_on() ) {
				return;
			}
			
			global $debug_log_array; // 1 = print_r, 2=var_dump;
			if ( ! $debug_log_array ) {
				$debug_log_array = 1;
			}
			
			// Get caller file and line
			$backtrace = debug_backtrace();
			$file_info = '';
			if ( ! empty( $backtrace[0] ) && is_array( $backtrace[0] ) ) {
				$file_info = $backtrace[0]['file'] . ":" . $backtrace[0]['line'];
			}
			
			// echo
			$text = strtoupper( $text );
			?>
            <pre style="background-color:#3c3c3c;color:white;border-left:2rem solid orangered;padding-left:2.2rem">
	<strong style="color:white">DEBUG&nbsp;<?= $text ?></strong><span
                        style="color:yellow;padding-left: 1rem"><?= $file_info ?></span>
	<?php
		if ( is_array( $to_debug ) || is_object( $to_debug ) ) {
			ob_start();
			if ( $debug_log_array === 2 ) {
				var_dump( $to_debug );
			} else {
				print_r( $to_debug );
			}
			echo( ob_get_clean() );
		} elseif ( null === $to_debug ) {
			echo( ' >>> VALEUR NULL' );
		} elseif ( is_string( $to_debug ) && '' === $to_debug ) {
			echo( ' >>> CHAINE VIDE' );
		} elseif ( empty( $to_debug ) ) {
			echo( ' >>> PAS DE DONNEES' );
		} else {
			echo( $to_debug );
		} ?>

	</pre>
		<?php }
	}