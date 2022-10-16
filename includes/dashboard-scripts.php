<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : default-scripts.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/19/22, 12:24 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	
	use dashboard\assets\Asset;
	use dashboard\assets\AssetsManager;
	use dashboard\hooks\Hooks;
	use dashboard\user\SessionManager;
	
	Hooks::instance()->add_action( 'dashboard/scripts', function () {
		Hooks::instance()->add_action( 'assets/register-css', function () {
			AssetsManager::instance()->add_to_css_list( 'theme', D_CSS_URL . 'theme.css', [ 'bootstrap', 'fa' ] );
			AssetsManager::instance()->add_to_css_list( 'dashboard', D_CSS_URL . 'dashboard.css', [
				'theme',
				'bootstrap',
			] );
			AssetsManager::instance()->add_to_css_list( 'bootstrap', BOOTSTRAP_CSS . 'bootstrap.min.css', [] );
			AssetsManager::instance()->add_to_css_list( 'scrollbar', SCROLLBAR_CSS, [] );
			AssetsManager::instance()->add_to_css_list( 'fa', FAWESOME_CSS . 'all.css', [] );
			/** @since 1.1.0 */
			AssetsManager::instance()->add_to_css_list( 'flags', FLAGS_CSS . 'flag-icons.min.css', [] );
			
		} );
		
		    Hooks::instance()->add_action( 'assets/register-js', function () {
			AssetsManager::instance()->add_to_js_list( 'choices', CHOICES_JS, [] );
			
			AssetsManager::instance()->add_to_js_list( 'jscookie', JSCOOKIE_JS. 'js.cookie.min.js', [] );
			AssetsManager::instance()->add_to_js_list( 'bootstrap', BOOTSTRAP_JS . 'bootstrap.bundle.min.js', [] );
			
			//AssetsManager::instance()->add_to_js_list( 'dsb', D_JS_URL . 'dsb.js', [],type: Asset::MODULE);
			AssetsManager::instance()->add_to_js_list( 'dashboard', D_JS_URL . 'dashboard.js', [
				'bootstrap',
				'jscookie',
			], type:                                   Asset::MODULE );
			
			$to_js = [
				'dsb_ajax' => [ 'get' => D_AJAX_GET, 'post' => D_AJAX_POST ],
				'ajax'     => [ 'get' => C_AJAX_GET, 'post' => C_AJAX_POST ],
			];
			/**
			 * If a user is logged in, we add information to the context
			 */
			$params = ( SessionManager::instance() )?->get_all();
			
//			$to_js['context']['logged']     = $params['logged-in'];
//
//			if ($params['logged-in']) {
//				$to_js['context']['user']       = $params['user'];
//				$to_js['context']['lifetime']   = $params['lifetime'];
//				$to_js['context']['connection'] = $params['connection-time'];
//				$to_js['context']['activity']   = $params['activity'];
//			}
			AssetsManager::instance()->add_inline_js( handle: 'dashboard', php2js: $to_js );
			
		} );
	} );