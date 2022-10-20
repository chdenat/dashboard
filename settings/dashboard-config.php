<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : dashboard-config.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/19/22, 11:55 AM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	/** Bootstrap directory */
	const BOOTSTRAP = 'bootstrap-5.2';
	/** Font Awesome directory */
	const FAWESOME = 'fontawesome';
	
	/** Dashboard CSS directory */
	const D_CSS_DIR = DPATH . 'assets/css/';
	/** Dashboard JS directory */
	const D_JS_DIR = DPATH . 'assets/js/';
	/** Dashboard images directory */
	const D_IMG_DIR = DPATH . 'assets/images/';
	/** Dashboard vendor directory */
	const D_VENDOR_DIR = DPATH . 'assets/vendor/';
	
	/** custom CSS directory */
	const C_CSS_DIR = CPATH . 'assets/css/';
	/** custom JS directory */
	const C_JS_DIR = CPATH . 'assets/js/';
	/** custom images directory */
	const C_IMG_DIR = CPATH . 'assets/images/';
	/** custom CSS directory */
	const C_VENDOR_DIR = CPATH . 'assets/vendor/';
	
	/** Dashboard Root */
	define( "D_URL", ROOTURL . D_NAME . ( empty( D_NAME ) ? '' : '/' ) );
	/** Dashboard CSS path */
	const D_CSS_URL = D_URL . 'assets/css/';
	/** Dashboard JS path */
	const D_JS_URL = D_URL . 'assets/js/';
	/** Dashboard images path */
	const D_IMG_URL = D_URL . 'assets/images/';
	/** Dashboard vendor path */
	const D_VDR_URL = D_URL . 'assets/vendor/';
	
	/** Custom Root */
	define( "C_URL", ROOTURL . C_NAME . ( empty( C_NAME ) ? '' : '/' ) );
	/** custom CSS path */
	const C_CSS_URL = C_URL . 'assets/css/';
	/** custom JS path */
	const C_JS_URL = C_URL . 'assets/js/';
	/** custom images path */
	const C_IMG_URL = C_URL . 'assets/images/';
	/** custom CSS path */
	const C_VDR_URL = C_URL . 'assets/vendor/';
	/** custom local  path */
	const LOCAL_URL = C_URL . LOCAL_BKP;
	
	
	/** Bootstrap CSS path */
	const BOOTSTRAP_CSS = D_VDR_URL . BOOTSTRAP . '/css/';
	/** Bootstrap JS path */
	const BOOTSTRAP_JS = D_VDR_URL . BOOTSTRAP . '/js/';
	/** Font Awesome CSS path */
	const FAWESOME_CSS = D_VDR_URL . FAWESOME . '/css/';
	/** Font Awesome JS path */
	const FAWESOME_JS = D_VDR_URL . FAWESOME . '/js/';
	
	/** Pseudo scrollbar CSS  */
	const SCROLLBAR_CSS = D_VDR_URL . 'overlay-scrollbars/OverlayScrollbars.min.css';
	
	/**  Choices JS  */
	const CHOICES_JS = D_VDR_URL . 'choices/choices.min.js';
	
	/** JS_Cookie JS path */
	const JSCOOKIE_JS = D_VDR_URL . 'js-cookie/';
	
	/** FLAGS CSS */
	/** @since 1.1.0 */
	const FLAGS_CSS = D_VDR_URL . 'flag-icons/css/';
	
	/** Templates locations */
	
	/**
	 * Directories where we can find templates.
	 *
	 * First is for Dashboard, second for Custom
	 *
	 * @since 1.0
	 */
	const TEMPLATE_DIRS = [
		CPATH . 'templates/',
		DPATH . 'templates/',
	];
	
	/**
	 * Directories where we can find assests associated to templates.
	 *
	 * First array is for URLs, second for Directories.
	 * Each sub-array is for each asset type, [dashboard,custom]
	 *
	 * @since 1.0
	 */
	const TEMPLATE_ASSETS = [
		'url' => [
			'css' => [ C_CSS_URL . 'templates/', D_CSS_URL . 'templates/' ],
			'js'  => [ C_JS_URL . 'templates/', D_JS_URL . 'templates/' ],
		],
		'dir' => [
			'css' => [ C_CSS_DIR . 'templates/', D_CSS_DIR . 'templates/' ],
			'js'  => [ C_JS_DIR . 'templates/', D_JS_DIR . 'templates/' ],
		],
	];
	
	/**
	 * Ajax
	 */
	
	const D_AJAX_GET  = D_URL . 'classes/ajax/get.php';
	const D_AJAX_POST = D_URL . 'classes/ajax/post.php';
	const C_AJAX_GET  = C_URL . 'classes/ajax/get.php';
	const C_AJAX_POST = C_URL . 'classes/ajax/post.php';
	
	/**
	 * FAVICON
	 */
	
	if ( ! defined( 'FAVICON' ) ) {
		define( 'FAVICON', C_URL . 'assets/images/favicon/' );
	}
	