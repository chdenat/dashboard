<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : Dashboard.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/18/22, 11:58 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard;
	
	use dashboard\assets\AssetsManager;
	use dashboard\hooks\Hooks;
	use dashboard\template\Template;
	use dashboard\user\SessionManager;
	
	
	class Dashboard {
		/**
		 * @var null|\dashboard\Dashboard
		 */
		private static ?Dashboard $instance = null;
		/** @var array|bool URL information */
		public array|bool $url_info;
		/** @var string|bool current page template */
		private string|bool $page_template;
		/** @var string|bool current page template with full path */
		private string|bool $located_template;
		
		private function __construct() {
			
			global $assets, $uri_manager, $hooks, $template;
			global $page_slug, $page_template;
			global $session;
			require_once DPATH . '/settings/loader.php';
			
			
			if ( ! defined( 'DDOING' ) ) {
				define( 'DDOING', true );
				$session = SessionManager::instance();
				$session->start(); //TODO manage lifetime
				ob_start();
				
				/**
				 * Step 1 : Configuration
				 *
				 * @since 1.0
				 */
				
				
				$this->url_info = URL_INFO;
				
				// Load custom startup functions
				require_once CPATH . 'startup.php';
				
				
				/**
				 * Step 2 : Template management
				 */
				
				$this->set_current_page_template();
				$page_template = $this->page_template;
				$page_slug     = dsb_slugify( $this->page_template );
				
				/**
				 * Step 3 : we launch the dashboard application
				 */
				
				$hooks->add_action( 'dashboard/init', [ __CLASS__, 'assets_manager' ] );
				$hooks->add_action( 'dashboard/load-page', [ __CLASS__, 'load_page' ] );
				
				// All is normally built, so we flush HTML/PHP
				$hooks->add_action( 'dashboard/loaded', [ __CLASS__, 'flush_all' ], 100 );
			}
		}
		
		/**
		 * It's a Singleton , this method is used to retrieve the instance
		 *
		 * @param  null|string  $configuration
		 *
		 * @return \dashboard\Dashboard
		 * @access  public
		 *
		 * @since   1.0
		 *
		 */
		public static function instance( string $configuration = null )
		: Dashboard {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self( $configuration );
			}
			
			return self::$instance;
		}
		
		/**
		 * Initialisation of the current page template
		 *
		 * If page template is defined in D_AUTH_URLS, we'll show it
		 * If page template is defined in C_AUTH_URLS, we'll show it
		 * If there is an error we replace the page template with 404
		 *
		 * else we redirect
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function set_current_page_template()
		: void {
			// We get template and look after it's real location
			$this->page_template = $this->get_template_page();
			
			// Best way is to rebuilt the url... TODO Is it true maybe we can user SERVER... ?
			$url = URIManager::instance()->build_url(
				short: false, params: URIManager::instance()->get_information()
			);
			
			
			$location = strtolower( $this->page_template);
			if ( in_array( $location , D_AUTH_URLS ) ) {
				$this->located_template = Template::instance()->locate_template( $this->page_template );
				// If not found, we continue with 404.
				if ( ! $this->located_template ) {
					$this->page_template    = '404';
					$this->located_template = Template::instance()->locate_template( $this->page_template );
					// 404 does not exist ...
					if ( ! $this->located_template ) {
						echo sprintf( _( '<h1>%s not found!</h1>' ), $this->get_current_page_template() );
					}
				}
			} else if ( in_array($location,C_AUTH_URLS??[] )) {;
				header( sprintf('Location: /%s',$location) );
				die();
			} else {
				header( 'Location: ' . $url );
				die();
			}
		}
		
	
	/**
	 * Used to add the page template as class in body
	 * Bound to template/body/classes hook
	 *
	 * @param $list
	 *
	 * @return mixed
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	static function add_template_to_body_class( $list )
	: mixed {
		$list[] = dsb_slugify( self::instance()->get_template_page() );
		
		return $list;
	}
	
	/**
	 * Returns the current page template
	 *
	 * @return bool|string
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	function get_current_page_template()
	: bool|string {
		return $this->page_template;
	}
	
	/**
	 * Return current page template file or false
	 *
	 * @return bool|string
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	function get_current_located_template()
	: bool|string {
		return $this->located_template;
	}
	
	public
	static function assets_manager() {
		Hooks::instance()->add_action( 'template/head/end', [ __CLASS__, 'print_head' ], 1 );
		Hooks::instance()->add_action( 'template/head/end', [ __CLASS__, 'print_assets_in_header' ], 2 );
		Hooks::instance()->add_action( 'template/body/end', [ __CLASS__, 'print_assets_in_footer' ] );
		Hooks::instance()->add_action( 'template/body/classes', [ __CLASS__, 'add_template_to_body_class' ] );
	}
	
	/**
	 * All the stuff has been loaded, so we flush all the buffers, whatever their level.
	 * This is the last step of the process
	 *
	 * @return void
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	static function flush_all()
	: void {
		$levels = ob_get_level();
		for ( $i = 0 ; $i < $levels ; $i ++ ) {
			ob_end_flush();
		}
	}
	
	/**
	 * Load page : load the header, the page template and the footer
	 *
	 * @return void
	 *
	 * @since 1.0
	 */
	public
	static function load_page()
	: void {
		$name = null;  // TODO manage it in URL and methods
		
		// Page header
		Template::instance()->page_header( $name );
		
		//Retrieves and displays the page template in the content template
		Template::instance()->page_content( self::instance()->get_current_located_template() );
		
		// Adds page footer
		Template::instance()->page_footer( $name );
	}
	
	
	/**
	 * Dashboard rendering
	 *
	 * Fires init, load-page then loaded actions.
	 *
	 * @return void
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	function render()
	: void {
		/**
		 * Fires after System initialisation
		 *
		 * @since 1.0
		 */
		Hooks::instance()->do_action( 'dashboard/init' );
		/**
		 * Fires page loading action
		 *
		 * @since 1.0
		 */
		Hooks::instance()->do_action( 'dashboard/load-page' );
		/**
		 * Fires actions after that the page has been loaded
		 *
		 * @since 1.0
		 */
		Hooks::instance()->do_action( 'dashboard/loaded' );
	}
	
	/**
	 * This method adds some code to the head tag.
	 *
	 * Bound by template/head/end action
	 *
	 * @return void
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	static function print_head()
	: void {
		/**
		 * Fires filter used to add some code just after the head
		 *
		 * @since 1.0
		 */
		echo( Hooks::instance()->apply_filters( 'dashboard/head', '' ) );
		/**
		 * Fires filtre used to add AssetsManager management
		 *
		 * @since 1.0
		 */
		echo( Hooks::instance()->apply_filters( 'dashboard/head/robots', '' ) );
		/**
		 * Fires filter used to add cache management
		 *
		 * @since 1.0
		 */
		echo( Hooks::instance()->apply_filters( 'dashboard/head/cache', '' ) );
		/**
		 * Fires filter used to add favicon
		 *
		 * @since 1.0
		 */
		echo( Hooks::instance()->apply_filters( 'dashboard/head/favicon', '' ) );
	}
	
	/**
	 * Used to print assets in Head tag.
	 *
	 * Hooked by template/head/end
	 *
	 * @return void
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	static function print_assets_in_header()
	: void {
		/**
		 * Fires the dashboard scripts and JS (Bootstrap, Font Awesome ...)
		 *
		 * @since 1.0
		 */
		Hooks::instance()->do_action( 'dashboard/scripts' );
		/**
		 * Fires custom scripts and JS
		 *
		 * @since 1.0
		 */
		Hooks::instance()->do_action( 'custom/scripts' );
		
		/**
		 * Fires action for CSS printing in header
		 *
		 * @since 1.0
		 */
		echo AssetsManager::instance()->print_all_css_assets();
		/**
		 * Fires action for JS printing in header
		 *
		 * @since 1.0
		 */
		echo AssetsManager::instance()->print_all_js_assets_header();
	}
	
	/**
	 * Used to print assets at the end of the Body tag.
	 *
	 * Hooked by template/body/end
	 *
	 * @return void
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	static function print_assets_in_footer() {
		/**
		 * Fires action for JS printing at the end of the Body tag
		 */
		echo AssetsManager::instance()->print_all_js_assets_footer();
	}
	
	
	/**
	 * Get the page template by template name or full file path
	 *
	 * @param  bool  $located  if true, returns the located template  (ie the full file path)
	 *                         else the template page file get from the query
	 *
	 * @return string
	 * @access public
	 *
	 * @since  1.0
	 *
	 */
	public
	function get_template_page( bool $located = false )
	: string {
		if ( $located ) {
			return $this->located_template;
		}
		$info = URIManager::instance()->get_information();
		
		// If there is no informatins, let's go on home
		if ('/' === $info['path']) {
			return 'home';
		}
		
		// It's a favicon, just return the information
		if (str_contains($info['path'],'favicon')) {
			return 'favicon';
		}

		// We have some information, send them
		if ( $info['params']['path-data']??null && !empty($info['params']['path-data'][0]) ) {
			return $info['params']['path-data'][0];
		}
		
		return 'home';
	}
	
	/**
	 * Get real user ip
	 *
	 * Usage :
	 * get_user_ip();
	 * get_user_ip('ERROR',FILTER_FLAG_NO_RES_RANGE);
	 *
	 * @from https://stackoverflow.com/questions/13646690/how-to-get-real-ip-from-visitor
	 *
	 * @param  null|string  $default         default return value if no valid ip found
	 * @param  int          $filter_options  filter options. default is FILTER_FLAG_NO_PRIV_RANGE |
	 *                                       FILTER_FLAG_NO_RES_RANGE
	 *
	 * @return string real user ip
	 *
	 * @since 1.0
	 *
	 */
	public
	function get_user_ip( string $default = null, int $filter_options = 12582912 )
	: ?string {
		$HTTP_X_FORWARDED_FOR  = isset( $_SERVER ) ? $_SERVER["HTTP_X_FORWARDED_FOR"] : getenv( 'HTTP_X_FORWARDED_FOR' );
		$HTTP_CLIENT_IP        = isset( $_SERVER ) ? $_SERVER["HTTP_CLIENT_IP"] : getenv( 'HTTP_CLIENT_IP' );
		$HTTP_CF_CONNECTING_IP = isset( $_SERVER ) ? $_SERVER["HTTP_CF_CONNECTING_IP"] : getenv( 'HTTP_CF_CONNECTING_IP' );
		$REMOTE_ADDR           = isset( $_SERVER ) ? $_SERVER["REMOTE_ADDR"] : getenv( 'REMOTE_ADDR' );
		
		$all_ips = explode( ",", "$HTTP_X_FORWARDED_FOR,$HTTP_CLIENT_IP,$HTTP_CF_CONNECTING_IP,$REMOTE_ADDR" );
		foreach ( $all_ips as $ip ) {
			if ( $ip = filter_var( $ip, FILTER_VALIDATE_IP, $filter_options ) ) {
				break;
			}
		}
		
		return $ip ?: $default;
	}
	}
	
