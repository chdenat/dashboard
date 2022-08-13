<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : SessionManager.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  2/3/22, 10:35 AM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	
	/**
	 * From https://www.php.net/manual/en/function.session-start.php#102460
	 */
	
	namespace dashboard\user;
	
	class SessionManager {
		const        LIFETIME_DEFAULT = 900;
		
		// THE only instance of the class
		private static ?SessionManager $instance = null;
		
		private function __construct() {
			global $session;
			//$session = $this;
		}
		
		/**
		 * It's a Singleton , this method is used to retrieve the instance
		 *
		 * @return \dashboard\user\SessionManager
		 *
		 * @since  1.0
		 */
		public static function instance()
		: SessionManager {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}
			
			return self::$instance;
		}
		
		/**
		 * (Re)starts the session.
		 *
		 * @param  null|string  $user      if specified, it is a login, we save login information else we just restart
		 *                                 the session.
		 * @param  int          $lifetime  only used at login, ie when $user is set
		 *
		 * @return    bool    true if the session has been initialized or(re)started, else false.
		 *
		 * @since 1.0
		 *
		 */
		public function start( string $user = null, int $lifetime = self::LIFETIME_DEFAULT )
		: bool {
			global $session;
			
			if ( PHP_SESSION_ACTIVE !== session_status() ) {
				if ( ! $this->active() ) {
					ini_set( 'session.cookie_lifetime', $lifetime );
					ini_set( 'session.gc_maxlifetime', $lifetime );
					ini_set( 'session.name', 'DSBSESSION' );
				}
				session_start();
			} else {
				$this->set_session_cookie( $lifetime );
			}
			if ( null !== $user ) {
				$this->set( [
					            'connexion' => time(),
					            'activity'  => time(),
					            'logged'    => true,
					            'user'      => $user,
					            'lifetime'  => $lifetime,
					            'permanent' => false,
					            'roles'     => [],
				            ] );
			}
			
			// send to global area
			$session = $this;
			
			return true;
		}
		
		/**
		 * Renew a session cookie
		 *
		 * @param $lifetime
		 *
		 * @return void
		 * @access  private
		 *
		 * @since   1.0
		 *
		 */
		private function set_session_cookie( $lifetime )
		: void {
			if ( isset( $_COOKIE[ session_name() ] ) ) {
				setcookie( session_name(), $_COOKIE[ session_name() ], time() + $lifetime, '/' );
			}
		}
		
		/**
		 * Checks if session is active
		 *
		 * @return bool true is session is active
		 * @access public
		 *
		 *
		 */
		public function active()
		: bool {
			return ( isset( $_SESSION['user'] ) );
		}
		
		/**
		 * Stores data in the session.
		 *
		 * @param  array  $session_data  array of parameters add to $_SESSION  [name=>value]
		 *
		 * @return void
		 *
		 * @since 1.0
		 */
		public function set( array $session_data = [] )
		: void {
			foreach ( $session_data as $name => $value ) {
				$_SESSION[ $name ] = $value;
			}
		}
		
		
		/**
		 *
		 * Get data from the session
		 *
		 * @param  string  $name  key of the data we want to retrieve
		 *
		 * @return null|string data stored in session or false if does not exist
		 *
		 * @since 1.0
		 *
		 */
		public function get( string $name )
		: ?string {
			return $_SESSION[ $name ] ?? false;
		}
		
		/**
		 *
		 * Get all from the session
		 *
		 * @return null|array data stored in session or false if does not exist
		 *
		 * @since 1.0
		 */
		public function get_all()
		: ?array {
			return $_SESSION ?? false;
		}
		
		/**
		 * Checks if a session data (named by the key) has been set
		 *
		 * @param  string  $name  Key name
		 *
		 * @return bool
		 *
		 * @since 1.0
		 *
		 */
		public function isset( string $name )
		: bool {
			return isset( $_SESSION[ $name ] );
		}
		
		/**
		 * Unsets a session data
		 *
		 * @param  string  $name  the key name
		 *
		 * @return void
		 *
		 * @since 1.0
		 *
		 */
		public function unset( string $name )
		: void {
			unset( $_SESSION[ $name ] );
		}
		
		/**
		 * Destroys the current session.
		 *
		 * @return    bool    TRUE is session has been deleted, else FALSE.
		 *
		 * @since 1.0
		 *
		 */
		public function destroy() {
			$this->start();
			$status = false;
			if ( $this->get( 'logged' ) ) {
				session_unset();
				$status = session_destroy();
				unset( $_SESSION );
			}
			
			return $status;
			
		}
	}
