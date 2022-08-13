<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : URIManager.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/19/22, 11:53 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard;
	
	class URIManager {
		/**
		 * @var \dashboard\URIManager|null
		 */
		private static ?URIManager $instance = null;
		/** @var array|bool The retrievd URL data */
		private array|bool          $data;
		/** @var string The application URL */
		public string              $url;
		
		/**
		 * @param null|string $url we can provide an URL, but by default we use current URL.
		 */
		private function __construct(string $url = null ) {
			$this->data = $this->parse_url( null );
			$this->url = $this->build_url();
		}
		
		/**
		 * It's a Singleton , this method is used to retrieve the instance
		 *
		 * @return \dashboard\URIManager
		 *
		 * @since  1.0
		 *
		 */
		public static function instance()
		: URIManager {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}
			
			return self::$instance;
		}
		
		/**
		 * Information getter
		 *
		 * @return bool|array
		 *
		 * @since  1.0
		 *
		 * @access public
		 *
		 */
		public function get_information()
		: bool|array {
			return $this->data;
		}
		
		/**
		 *
		 * Retrieve all the information, parameters from an URL and return an array containing all.
		 *
		 * @param  string|null  $url  We can provided ant URL, but by default we use the current one
		 *
		 * @return array
		 *
		 * @since  1.0
		 *
		 * @access private
		 *
		 */
		private function parse_url( ?string $url = null )
		: array {
			
			$data = [];
			if ( $url === null ) {
				// port (only if not 80 or 443)
				$port = $_SERVER['SERVER_PORT'];
				$port = ! in_array( $port, [ '80', '443' ], true ) ? ":{$port}" : '';
				// we rebuild the URL and parse it (lazy...)
				$url = $_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['HTTP_HOST'] . $port . $_SERVER['REQUEST_URI'];
			}
			
			$data = parse_url( $url );
			
			// Cleans the path (if it contains leading and/or ending /) and saves it as array
			$data['path-decoded'] = null;
			if ( str_contains( '/', $data['path']??null && '/' === $data['path'] ) ) {
				$data['path-decoded'] = explode( '/', rtrim( ltrim( $data['path'], '/' ), '/' ) );
			}
			
			// Get all parameters from paths and query
			$data['params'] = [];
			
			if ( null !== $data['path-decoded'] ) {
				$data['params']['path-data'] = $data['path-decoded'];
			}
			
			if ( isset( $data['query'] ) ) {
				foreach ( explode( '&', $data['query'] ) as $info ) {
					if (str_contains($info,'=')) {
						[ $k, $v ] = explode( '=', $info );
						$data['params'][ $k ] = $v;
					}
				}
			}
			
			return $data;
			
		}
		
		
		/**
		 * Build an URL from the URL data similar to parse_url results.
		 * 
		 * @param  bool        $short   short url (ie URL+ RELPATH if true, or complete URL if false)
		 * @param  bool|array  $params  array of parameters (must respect the format retrieved by Template->parse_url.
		 *
		 * @return string   the URL
		 *
		 * @since  1.0
		 *
		 * @access private
		 *
		 */
		
		function build_url( bool $short = true ,bool|array $params=false)
		: string {
			if (!$params) {
				$params = $this->data;
			}
			
			$url = ( isset( $params['host'] ) ? (
				( isset( $params['scheme'] ) ? "$params[scheme]://" : '//' ) .
				( isset( $params['user'] ) ? $params['user'] . ( isset( $params['pass'] ) ? ":$params[pass]" : '' ) . '@' : '' ) .
				$params['host'] .
				( isset( $params['ssh_port'] ) ? ":$params[port]" : '' )
			) : '' );
			if ( $short ) {
				return $url . '/' . RELTPATH;
			}
			$url = ( $params['path'] ?? '/' ) .
			       ( isset( $params['query'] ) ? '?' . ( is_array( $params['query'] ) ? http_build_query( $params['query'], '', '&' ) : $params['query'] ) : '' ) .
			       ( isset( $params['fragment'] ) ? "#$params[fragment]" : '' );
			
			return $url;
		}
	}