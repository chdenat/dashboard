<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : AjaxManager.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/26/22, 6:46 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard\ajax;
	
	use dashboard\Debug;
	use shelteradmin\box\Box;
	use dashboard\DSBException;
	use dashboard\template\Template;
	use dashboard\user\SessionManager;
	use dashboard\user\UserManager;
	use shelteradmin\box\BoxAPI;
	use phpseclib3\Exception\ConnectionClosedException;
	
	class AjaxManager {
		
		/**
		 * @throws \JsonException
		 */
		public static function post( $params ) {
			header( 'Content-Type: application/json; charset=utf-8' );
			switch ( $params['action'] ) {
				
				case 'login' :
					try {
						// try to login and return result
						self::done( 'authorization', UserManager::instance()->login( $params['user'], $params['password'] ) );
					}
					catch ( DSBException $exception ) {
						// An error occurs, let's inform the referrer
						self::send_error( $exception );
					}
					
					break;
				
				case 'logout' :
					UserManager::instance()->logout();
					self::done( 'logout' );
					break;
				
				case 'confirm' :
					try {
						$new = $old = $confirm = null;
						extract( $params, EXTR_OVERWRITE );
						if ( UserManager::instance()->change_password( $user, $new, $confirm, $old ) ) {
							self::done( 'changed' );
						}
					}
					catch ( DSBException $exception ) {
						self::send_error( $exception );
					}
					break;
				
			}
			
		}
		
		/**
		 * @throws \JsonException
		 */
		protected static function done( $key = 'done', mixed $value = true )
		: void {
			echo( json_encode( [ $key => $value ], JSON_THROW_ON_ERROR ) );
		}
		
		/**
		 * @param  null|\dashboard\DSBException  $exception
		 * @param  null|int                      $code
		 * @param  null|string                   $message
		 *
		 * @return void
		 */
		protected static function send_error(
			?DSBException $exception = null, int $code = null, string $message =
		null
		)
		: void {
			$code    = $code ?? $exception?->getCode();
			$message = $message ?? $exception?->getMessage();
			header( sprintf( 'HTTP/1.1 %d %s', $code, $message ) );
		}
		
		/**
		 * @throws \JsonException
		 * @throws \Exception
		 */
		public static function get( $params ) {
			
			switch ( $params['action'] ?? false ) {
				case 'login-form':
					if ( $template = Template::instance()->locate_template( 'modals/user/login' ) ) {
						require_once( $template );
					}
					break;
				
				case 'logout-confirm':
					if ( $template = Template::instance()->locate_template( 'modals/user/logout' ) ) {
						require_once( $template );
					}
					break;
				
				case 'change-password':
					if ( $template = Template::instance()->locate_template( 'modals/user/change-password' ) ) {
						require_once( $template );
					}
					break;
					
				case 'read-json-menu':
					echo file_get_contents(Template::instance()->locate_template( 'menu','json'));
					break;
				
				
				case 'load-template':
					
					if ( $template = Template::instance()->locate_template( $params['template'] ) ) {
						ob_start();
						Template::instance()->include_block( $params['template'], params: json_decode( $params['parameters'], true ) ?? [] );
						// we return also the templte in case the template provided is a directory
						// We do not use json, due to some errors caused sometimes by some bad formatted HTML ...
						echo  $template.'###'. ob_get_clean();
					} else {
						self::send_error( code: 404, message: _( 'Template does not exist ...' ) );
					}
					break;
				
				case 'get-session':
					SessionManager::instance()->start();
					header( 'Content-Type: application/json; charset=utf-8' );
					echo json_encode( $_SESSION );
					break;
				
				case 'end-session':
					if ( $template = Template::instance()->locate_template( 'modals/user/end-session' ) ) {
						require( $template );
					}
					break;
				
				case 'end-session-soon':
					if ( $template = Template::instance()->locate_template( 'modals/user/end-session-soon' ) ) {
						require( $template );
					}
					break;
			}
			
		}
		
	}