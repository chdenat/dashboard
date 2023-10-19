<?php
	
	/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : loader.php                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 19/10/2023  10:10                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
	
	
	// Init errors management

use dashboard\assets\AssetsManager;
use dashboard\hooks\Hooks;
use dashboard\template\Template;
use dashboard\URIManager;

/**
	 * Used to initialize the error log in a specific file, located in ABSPATH and named errors.log
	 *
	 * @param  bool  $debug  : If false theres is no log. Default is DEBUG global value
	 *
	 * @return void
	 * @access private
	 *
	 * @since  1.0
	 *
	 */
	
	ini_set( "display_errors", false );
	if ( DEBUG ) {
		//error_reporting( E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_WARNING | E_PARSE |
		//                  E_USER_ERROR | E_USER_WARNING | E_RECOVERABLE_ERROR );
		
		error_reporting( E_ALL );
		ini_set( "log_errors", true );
		ini_set( 'error_log', ABSPATH . 'errors.log' );
	}
	
	/**
	 * Classes autoloading
	 *
	 * @param $class the class to use
	 *
	 * @since  1.0
	 *
	 */
	
	spl_autoload_register( function ( $class )
	: void {
		/**
		 * Classes are in top level directory 'classes' but in class name, namespace is 'dashboard'..
		 * So we replace the things to make it working.
		 */
		$class = str_replace( '\\', '/', $class );

		/**
		 * Class contains the namespace, so if it is found in it, we know where is the class
		 */
		
		// For the dashboard, the namespace is hardcoded to 'dashboard' but it can differ in the custom part
		if ( str_contains( $class, 'dashboard' ) ) {
            // dashboard
			$class = str_replace( [ 'dashboard', '\\' ], [ '/' . D_NAME . '/classes', '/' ], $class );
		} elseif ( str_contains( $class, C_NAMESP ) ) {
            // classes on client
			$class = str_replace( [ C_NAMESP, '\\', ], [ '/' . C_NAME . '/classes', '/' ], $class );
		} elseif ( str_contains( $class, 'phpseclib' ) ) {
            // phpseclib
			$class = str_replace( [ 'phpseclib', '\\' ], [ '/' . D_NAME . '/classes/vendor/phpseclib', '/' ], $class );
		} elseif ( str_contains( $class, 'ConstantTime' ) ) {
            // ParagonIE
			$class = str_replace( [ 'ParagonIE/ConstantTime', '\\' ], [
				'/' . D_NAME . '/classes/vendor/ConstantTime',
				'/',
			],                    $class );
        } elseif (str_contains($class, 'CrontabManager')) {
            // TiBeN/CrontabManager
            $class = str_replace(['TiBeN/CrontabManager', '\\'], [
                '/' . D_NAME . '/classes/vendor/CrontabManager',
                '/',
            ], $class);
        }
		
		require_once ABSPATH . $class . '.php';
	}
	);
	
	/**
	 * Autoloader has been loaded, so we can now instantiate our singletons.
	 *
	 * TODO use globals elsewhere
	 */
	
	$assets = AssetsManager::instance();
	$uri_manager = URIManager::instance();
	$hooks = Hooks::instance();
	$template = Template::instance();
	
	// Manage URLs
	define( 'URL_INFO', $uri_manager->get_information() );
	Define( 'ROOTURL', $uri_manager->url ) . '/';
	
	
	// Dashboard configuration
	require_once DSETTINGS_DIR . 'dashboard-config.php';
	
	// we need some files
	require_once DINCLUDES_DIR . 'utils.php';
	
	// Load default scripts and styles
	require_once DINCLUDES_DIR . 'dashboard-scripts.php';
	
	// Load text to translates at the end of the body, before the JS
	Hooks::instance()->add_action( 'template/body/end', function() {
		// Dashboard
		require_once DSETTINGS_DIR . 'texts-4-i18n.php';
		// App
		if (file_exists( CSETTINGS_DIR . 'texts-4-i18n.php')) {
			require_once CSETTINGS_DIR . 'texts-4-i18n.php';
		}
	},1 );