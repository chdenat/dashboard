<?php
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : utils.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/18/22, 3:44 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use \dashboard\template\Template;
	use dashboard\hooks\Hooks;
	
	
	
	
	/**
	 * Adds the classes to the html tag
	 *
	 * > should be added in body
	 *
	 * @return string
	 *
	 * @since 1.0
	 */
	function html_classes()
	: string {
		return Template::instance()->html_classes();
	}
	
	/**
	 * Adds the classes to the body tag
	 *
	 * > should be added in body
	 *
	 * @return string
	 *
	 * @since  1.0
	 */
	function body_classes()
	: string {
		return Template::instance()->body_classes();
	}
	
	/**
	 * Adds dashboard/head/common action
	 *
	 * @return void
	 *
	 * @since 1.0
	 */
	Hooks::instance()->add_filter( 'dashboard/head', static function ( string $content ) {
		ob_start();
		require_once DINCLUDES_DIR . 'head/common.php';
		
		return $content . ob_get_clean();
	} );
	
	/**
	 * Adds  dashboard/head/favicon action
	 *
	 * @return void
	 *
	 * @since 1.0
	 */
	Hooks::instance()->add_filter( 'dashboard/head/favicon', static function ( string $content ) {
		ob_start();
		require_once DINCLUDES_DIR . 'head/favicon.php';
		return $content . ob_get_clean();
	} );
	
	
	/**
	 * Adds  dashboard/head/robots action
	 *
	 * @return void
	 *
	 * @since 1.0
	 */
	Hooks::instance()->add_filter( 'dashboard/head/robots', static function ( string $content ) {
		ob_start();
		require_once DINCLUDES_DIR . 'head/robots.php';
		
		return $content . ob_get_clean();
	} );
	
	/**
	 * Adds dashboard/head/cache action
	 *
	 * @return void
	 *
	 * @since 1.0
	 */
	Hooks::instance()->add_filter( 'dashboard/head/cache', static function ( string $content ) {
		ob_start();
		require_once DINCLUDES_DIR . 'head/cache.php';
		
		return $content . ob_get_clean();
	} );
	
	/**
	 * Used to slugify a string
	 *
	 * @param  string  $to_slug  The text to slugify
	 *
	 * @return string the slugified string
	 *
	 * @since   1.0
	 *
	 */
	function dsb_slugify( string $to_slug )
	: string {
		return strtolower( preg_replace( '/[^a-zA-Z0-9\-]/', '', preg_replace( '/\s+/', '-', preg_replace(
			'/\/+/', '-', $to_slug ) ) ) );
	}
	
