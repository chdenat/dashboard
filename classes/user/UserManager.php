<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : UserManager.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/28/22, 6:54 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard\user;
	
	use dashboard\Debug;
	use dashboard\DSBException;
	use Exception;
	
	class UserManager {
		/**
		 * @var null|\dashboard\user\UserManager
		 */
		private static ?UserManager $instance = null;
		public const PSWD_TYPE_FILE = 'file';
		public const PSWD_TYPE_DB   = 'db';
		
		private function __construct() {
			require_once CSETTINGS_DIR . 'authentication/settings.php';
			
			if ( ! defined( 'AUTH_DIR' ) ) {
				die( _( 'Authentification directory not defined. Stop here!' ) );
			} else {
				
				// Let's some check
				if (!$this->check_password_db()) {
					// If we use a file, but this does not exist,
					// copy it from old location to new.
					if (self::PSWD_TYPE_FILE === $this->get_password_db_type()) {
						copy(DSETTINGS_DIR.'auth/dbpsw.avm',PSWD_DB['file']);
					}
					
				}
				
			}
			
			/**
			 * Reset DB if something's wrong
			 */
			if ( self::PSWD_TYPE_FILE === $this->get_password_db_type() ) {
				if ( ! $this->check_password_db() ) {
					if ( ! $this->reset_password_db() ) {
						throw new DSBException( _( "Error during password DB reset." ), 460 );
					}
				}
			}
			
			
		}
		
		/**
		 * It's a Singleton , this method is used to retrieve the instance
		 *
		 * @return \dashboard\user\UserManager
		 *
		 * @since  1.0
		 *
		 */
		public static function instance()
		: UserManager {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}
			
			return self::$instance;
		}
		
		/**
		 * Returns the password db type (file or DB)
		 *
		 * @return string
		 * @access  private
		 *
		 * @since   1.0
		 *
		 */
		private function get_password_db_type()
		: string {
			return PSWD_DB['type'];
		}
		
		/**
		 * Checks if password db is ok
		 *
		 * @return bool
		 * @access  private
		 *
		 * @since   1.0
		 *
		 */
		private function check_password_db()
		: bool {
			if ( self::PSWD_TYPE_FILE === $this->get_password_db_type() ) {
				return file_exists( PSWD_DB['file'] );
			}
			
			return false;
		}
		
		/**
		 * Resets the password db
		 *
		 * @return bool
		 * @access  private
		 *
		 * @since   1.0
		 *
		 */
		private function reset_password_db()
		: bool {
			if ( self::PSWD_TYPE_FILE === $this->get_password_db_type() ) {
				return copy( DSETTINGS_DIR.'auth/dbpsw-default.avm', PSWD_DB['file'] );
			}
			
			return false;
		}
		
		/**
		 * Get the password in db for a specific user
		 *
		 * @param  string  $user
		 *
		 * @return array|false if it's ok, return an array of [user,password] else false
		 * @access  public
		 *
		 * @throws DSBException
		 * @since   1.0
		 *
		 */
		public function get_user_information( string $user )
		: bool|array {
			if ( $this->check_password_db() ) {
				if ( self::PSWD_TYPE_FILE === $this->get_password_db_type() ) {
					$fnum     = fopen( PSWD_DB['file'], 'r' );
					$password = fgets( $fnum );
					fclose( $fnum );
					
					return [ 'user' => $user, 'password' => $password ];
				}
				throw new DSBException( _( 'Error when fetching password DB.' ), 460 );
				
			}
			
			throw new DSBException( sprintf( _( 'User %s not found.' ), $user ), 463 );
		}
		
		/**
		 *
		 * We compare the password as input with the saved one.
		 *
		 * @param  string  $input    input password
		 * @param  string  $saved    saved password
		 * @param  int     $code     error code
		 * @param  string  $message  error message
		 *
		 * @return bool
		 * @throws \dashboard\DSBException
		 * @access public
		 *
		 * @since  1.0
		 */
		public function verify_password(
			string $input, string $saved, int $code = 463, string $message = 'Password does not match.'
		)
		: bool {
			if ( password_verify( $input, $saved ) ) {
				return true;
			}
			throw new DSBException( _( $message ), $code );
		}
		
		/**
		 * Get the credentials and try to login.
		 *
		 * @param  string  $user
		 * @param  string  $password
		 *
		 * @return bool     login succesful or not
		 * @access public
		 *
		 * @throws \dashboard\DSBException
		 * @since  1.0
		 *
		 */
		public function login( string $user, string $password )
		: bool {
			$info = $this->get_user_information( $user );
			// Bail early if we do not kow the user
			if ( empty( $user ) ) {
				throw  new DSBException( _( 'Unknown user.' ), 467 );
			}
			
			// Checks if passwords are not empty.
			if ( empty( $password ) ) {
				throw new DSBException( _( 'Password cannot be empty.' ), 464 );
			}
			$success = $this->verify_password( $password, $info['password'] );
			if ( $success ) {
				global $session;
				SessionManager::instance()->start($user);
			}
			
			return $success;
		}
		
		/**
		 * Clear the session information
		 *
		 * @return void
		 *
		 * @since 1.0
		 *
		 */
		public function logout()
		: void {
			SessionManager::instance()->destroy();
		}
		
		/**
		 * @param  string  $user
		 * @param  string  $new
		 * @param  string  $confirm
		 * @param  string  $old
		 *
		 * @return bool
		 * @throws \dashboard\DSBException
		 */
		public function change_password( string $user, string $new = '', string $confirm = '', string $old = '' )
		: bool {
			
			// Bail early if we do not kow the user
			if ( empty( $user ) ) {
				throw  new DSBException( _( 'Unknown user.' ), 467 );
			}
			
			// Checks if passwords are not empty.
			if ( empty( $new ) || empty( $old ) || empty( $confirm ) ) {
				throw new DSBException( _( 'Password cannot be empty.' ), 464 );
			}
			// Checks if new and confirmation passwords are matching.
			if ( $new !== $confirm ) {
				throw new DSBException( _( 'New and confirmation passwords do not match.' ), 465 );
			}
			
			// Checks if old password is correct
			$info = $this->get_user_information( $user );
			
			$success = $this->verify_password( $old, $info['password'], code: 463, message: 'Current password is incorrect.' );
			
			// All is fine, saving new password.
			$password = password_hash( $new, PASSWORD_BCRYPT, [ 'cost' => 11 ] );
			
			if ( self::PSWD_TYPE_FILE === $this->get_password_db_type() ) {
				try {
					$fnum = fopen( PSWD_DB['file'], 'w' );
					if ( ! $fnum ) {
						throw new Exception();
					}
					fwrite( $fnum, $password );
					fclose( $fnum );
					SessionManager::instance()->destroy();
				}
				catch ( \Exception $exception ) {
					throw new DSBException( 'Error with file DB.', 468 );
				}
			}
			
			return true;
		}

		
		private function check_password_strength() {
			// Given password
			$password = 'user-input-pass';
			
			// Validate password strength
			$uppercase = preg_match('@[A-Z]@', $password);
			$lowercase = preg_match('@[a-z]@', $password);
			$number    = preg_match('@[0-9]@', $password);
			$specialChars = preg_match('@[^\w]@', $password);
			
			if(!$uppercase || !$lowercase || !$number || !$specialChars || strlen($password) < 8) {
				echo 'Password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character.';
			}else{
				echo 'Strong password.';
			}
			
	}
		
	}