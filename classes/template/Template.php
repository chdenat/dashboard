<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : Template.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/18/22, 11:20 AM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard\template;
	
	use dashboard\assets\Asset;
	use dashboard\assets\AssetsManager;
	
	use dashboard\hooks\Hooks;
	use dashboard\Debug;
	use dashboard\user\SessionManager;
	
	class Template {
		/**
		 * @var null|\dashboard\template\Template
		 *
		 * @access private
		 *
		 * @static
		 */
		private static ?Template $instance = null;
		
		/**
		 * Constructor
		 */
		private function __construct() {
			
			// Define the different template types we can manage
			
			/** Bloc template type */
			define( 'BLOCK', 'block' );
			/** Bloc template sub directory name */
			define( 'BLOCK_DIR', BLOCK . '/' );
			/** Page template type */
			define( 'PAGE', 'page' );
			/** Page template sub directory name */
			define( "PAGE_DIR", PAGE . '/' );
			
			$this->set_referrer();
		}
		
		/**
		 * It's a Singleton , this method is used to retrieve the instance
		 * initialisation : see parameters in constructor comments
		 *
		 * @return \dashboard\template\Template
		 * @access public
		 *
		 * @since  1.0
		 */
		public static function instance()
		: Template {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}
			
			return self::$instance;
		}
		
		/**
		 * Add in the header, all elements used by Idefix to run
		 * (jss, css, specific Meta ...)
		 * For this we execute the hook page-header.
		 *
		 * @param  null|string  $slug
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function page_header( ?string $slug = '' )
		: void {
			/**
			 * Fires at the beginning, before any HTML code
			 *
			 * @since 1.0
			 */
			Hooks::instance()->do_action( 'template/before-start' );
			$this->include( 'header' . ( ! empty( $slug ) ? '-' : '' ) . $slug );
			
		}
		
		/**
		 * Content templating
		 *
		 * @param  string  $template
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 */
		public function page_content( $template = '' )
		: void {
			$this->include( 'content', [ 'template' => $template ] );
			
		}
		
		/**
		 * Add some code at the end of the head tag.
		 *
		 * This code can be added by using the action template/head/end
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function head_end()
		: void {
			/**
			 * Fires ate the end of head, just before closing.
			 *
			 * @since 1.0
			 */
			Hooks::instance()->do_action( 'template/head/end' );
			
		}
		
		/**
		 * Add some code just after the open body tag.
		 *
		 * This code can be added by using the action template/body/start
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function body_start()
		: void {
			/**
			 * Fires ate the start of body tag, just after the open tag.
			 *
			 * @since 1.0
			 */
			Hooks::instance()->do_action( 'template/body/start' );
		}
		
		/**
		 * Add some code just after the close body tag.
		 *
		 * This code can be added by using the action template/body/end
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function body_end()
		: void {
			
			/**
			 * Fires ate the send of body tag, just after the close tag.
			 *
			 * @since 1.0
			 */
			Hooks::instance()->do_action( 'template/body/end' );
		}
		
		/**
		 * Add classes to the body element
		 *
		 * @return string
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function body_classes()
		: string {
			/**
			 * Filters the class added to the body tag
			 *
			 * @since 1.0
			 */
			
			$classes = [ 'dashboard' ];
			if ( SessionManager::instance()->active() ) {
				$classes[] = $_SESSION['user'];
				$classes[] = 'logged-in';
			}
			$list = implode( ' ', Hooks::instance()->apply_filters( 'template/body/classes', $classes ) );
			
			
			return ( $list ) ? 'class="' . $list . '"' : '';
		}
		
		/**
		 * Add classes to the html element
		 *
		 * @return string
		 * @access  public
		 *
		 * @since   1.0
		 *
		 */
		public function html_classes()
		: string {
			/**
			 * Filters the class added to the html tag
			 *
			 * @since 1.0
			 */
			$list = implode( ' ', Hooks::instance()->apply_filters( 'template/html/classes', [] ) );
			
			return ( $list ) ? 'class="' . $list . '"' : '';
		}
		
		/**
		 * Add in the footer all elements used by Idefix to run
		 * (jss, css, specific code Meta ...)
		 * For this we execute the hook page-footer.
		 *
		 * @param  null|string  $slug
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 */
		public function page_footer( ?string $slug = '' )
		: void {
			
			//It's time to add the page footer.
			self::instance()->include_block( 'footer' . ( ! empty( $slug ) ? '-' : '' ) . $slug );
			
			// Toast or bread ?
			self::instance()->include_block( 'toast' . ( ! empty( $slug ) ? '-' : '' ) . $slug );
			
			/**
			 * Fires after any HTML code
			 *
			 * @since 1.0
			 */
			echo Hooks::instance()->do_action( 'template/after-end' );
		}
		
		/**
		 *
		 * Include template function
		 *
		 *
		 * @param  string  $template  template name (could be template or directory/template even dir/subdir/template
		 * @param  array   $params    The parameters that will be passed to the template
		 * @param  bool    $once      Require or require_once (default)
		 * @param  string  $type      Template type (BLOCK|PAGE)
		 *
		 * @return void
		 * @access public
		 *
		 * @since  1.0
		 */
		public function include( string $template, array $params = [], bool $once = true, string $type = PAGE )
		: void {
			ob_start();
			
			$file = $template;
			
			/**
			 * If it is a block, we save the template in a global (this has already been done if it is page_template)
			 */
			if ( BLOCK === $type ) {
				global $block_template, $block_slug;
				$block_template = $template;
				$block_slug     = dsb_slugify( $template );
			}
			
			if ( ! $this->template_located( $template ) ) {
				/**
				 * The template has not been yet located. We try to do it.
				 *
				 * Note: Page templates hase been located in Dashboard class,so here we
				 *       should check only block templates.
				 *       So we do not redirect to a 404 page, but just add an alert to the page
				 */
				$file = $this->locate_template( $template );
				if ( ! $file ) {
					// adds an error message
					ob_start(); ?>
                    <p style="color:red">
						<?= sprintf( _( '%s not found !!!' ), $template ) ?>
                    </p>
					<?php echo ob_get_clean();
				}
			}
			
			if ( Debug::is_debug_on() ) {
				echo $this->comments( 'Template ' . $template );
			}
			
			/**
			 * We pass parameters
			 *
			 * If type === PAGE we add some info
			 *
			 */
			if ( PAGE === $type ) {
				$params['__type']   = 'page';
				$params['__whoami'] = $template;
			}
			
			
			$this->set_template_parameters( $params );
			
			if ( $once ) {
				require_once $file;
			} else {
				require $file;
			}
			if ( PAGE === $type ) {
				SessionManager::instance()->set( [ 'page' => $template ] );
			}
			// We clear parameters
			$this->clear_template_parameters();
			
			if ( Debug::is_debug_on() ) {
				echo $this->end_comments();
			}
			
			echo ob_get_clean();
		}
		
		/**
		 * Alias of include, for blocks
		 *
		 * @param  string  $template
		 * @param  array   $params
		 * @param  bool    $once
		 *
		 * @return void
		 */
		public function include_block( string $template, array $params = [], bool $once = true ) {
			$this->include( $template, $params, $once, BLOCK );
		}
		
		
		/**
		 * Set the parameters that will be passed to a template
		 *
		 * @param  array  $params  array or parameters
		 *
		 * @return void
		 * @access  private
		 *
		 * @since   1.0
		 *
		 */
		private function set_template_parameters( array $params )
		: void {
			global $template_parameters;
			$template_parameters = $params;
		}
		
		/**
		 * Clear the parameters passed to a template
		 *
		 * To avoid mismatch beetween several templates
		 *
		 * @return void
		 * @access private
		 *
		 * @since  1.0
		 *
		 */
		private function clear_template_parameters()
		: void {
			global $template_parameters;
			$template_parameters = [];
		}
		
		/**
		 * Get the parameters passed to a template.
		 *
		 * Parameters are the cleared from templates area.
		 *
		 * @return null|array
		 * @access  public
		 *
		 * @since   1.0
		 */
		public function get_template_parameters()
		: ?array {
			global $template_parameters;
			$current = $template_parameters;
			$this->clear_template_parameters();
			
			return $current;
		}
		
		/**
		 * Used to add any template asset (PAGE or BLOCK)
		 *
		 * @param  string  $js
		 * @param  string  $css
		 * @param  array   $php2js
		 * @param  string  $type
		 *
		 * @return void
		 * @access public
		 **
		 * @since  1.0
		 *
		 */
		public function add_template_assets( string $js = '', string $css = '', array $php2js = [], string $type = PAGE
		)
		: void {
			
			global $block_template, $block_slug, $page_template, $page_slug;
			$template = ( $type === PAGE ) ? $page_template : $block_template;
			$slug     = ( $type === PAGE ) ? $page_slug : $block_slug;
			
			if ( isset( $template ) ) {
				// We locate standard templates, but if some others are in inputs  we get them
				$assets               = AssetsManager::instance()->locate_template_assets( $template, $type );
                if ($assets) {
	                $assets[ Asset::JS ]  = empty( $js ) ? ( $assets[ Asset::JS ] ?? AssetsManager::instance()->locate_template_assets( $js, $type ) ) : false;
	                $assets[ Asset::CSS ] = empty( $css ) ? ( $assets[ Asset::CSS ] ?? AssetsManager::instance()->locate_template_assets( $css, $type ) ) : false;
	
	                //$handle = $this->slugify( $type . '-' . $template );
	                $handle = $type . '-' . $slug;
	                if ( $assets[ Asset::JS ] ) {
		                AssetsManager::instance()->add_to_js_list( $handle, $assets[ Asset::JS ], [ 'custom' ] );
	                }
	                if ( ! empty( $php2js ) ) {
		                AssetsManager::instance()->add_inline_js( handle: $handle, deps: [ $handle ], before: Asset::AFTER,
			                php2js:                                       $php2js );
	                }
	                if ( $assets[ Asset::CSS ] ) {
		                AssetsManager::instance()->add_to_css_list( $handle, $assets[ Asset::CSS ], [ 'custom' ], $type );
	                }
                }
			}
		}
		
		/**
		 * Its an alias of add_template_assets with $type set to BLOCK
		 *
		 * @param  string  $js
		 * @param  string  $css
		 * @param  array   $php2js
		 *
		 * @return void
		 * @access public
		 *
		 * @uses   add_template_assets
		 *
		 * @since  1.0
		 *
		 */
		public function add_bloc_template_assets( string $js = '', string $css = '', array $php2js = [] )
		: void {
			$this->add_template_assets( $js, $css, $php2js, BLOCK );
		}
		
		
		/**
		 * Set referrer
		 *
		 * From Dashboard.    TODO what is the purpose ?
		 *
		 * @return void
		 * @access private
		 *
		 * @since  1.0
		 *
		 */
		private
		function set_referrer()
		: void {
			$path_parts          = pathinfo( $_SERVER['PHP_SELF'] );
			$_SESSION['referer'] = $path_parts['basename'];
		}
		
		/**
		 * This functions is used to declare an HTML comment with text centered.
		 *
		 * @param  string  $comment  The comment
		 * @param  int     $width    The total length of comment
		 * @param  string  $char     the character used before and after the comment [*]
		 *
		 * @return string
		 * @access  public
		 *
		 * @since   1.0
		 *
		 */
		public
		function comments(
			string $comment, int $width = 120, string $char = '-'
		)
		: string {
			$w = $width - 14; // 7 for start comment, 5 for end comment + 2 spaces before and after comment
			if ( strlen( $comment ) > $w ) {
				$comment = '[...]' . substr( $comment, - 2 / 3 * $w );
			}
			$s = str_repeat( $char,intval(( $w - strlen( $comment ) ) / 2) );
			ob_start(); ?>
            <!--  <?= $s ?>  <?= $comment ?>  <?= $s ?> -->
			<?php
			return ob_get_clean();
		}
		
		/**
		 * No text, used to close a commented area
		 *
		 * @return string
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public
		function end_comments()
		: string {
			return $this->comments( '-------' );
		}
		
		/**
		 * Try to locate a template file in dashboard or custom locations.
		 *
		 * It's a fifo mode...
		 *
		 * @param  string  $template  the template name
		 *
		 * @return bool|string the full location or false if not found
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function locate_template( string $template, $extension = 'php' )
		: bool|string {
			
			$real = false;
			// We scan directories
			foreach ( TEMPLATE_DIRS as $location ) {
				/**
				 * we search in / or /pages/ in fifo mode
				 *
				 */
				foreach ( [ '', 'pages/' ] as $sub_location ) {
					$file = $location . $sub_location . $template;
					// We check if it is a directory. In this case we assume there is an index.php file
					// else we try to locate the template
					$file = is_dir( $file ) ? sprintf( '%s/index.%s', $file, $extension )
						: sprintf( '%s.%s', $file, $extension );
					// The first in, the first out ...
					if ( file_exists( $file ) ) {
						$real = $file;
						break 2; //Got it !! Exit
					}
				}
				
			}
			
			return $real;
		}
		
		/**
		 * Checks if a template has been located
		 *
		 * @param  string  $template  to localise
		 *
		 * @return bool
		 * @access public
		 *
		 * @since  1.0
		 *
		 */
		public function template_located( string $template )
		: bool {
			// We first check if template is a directory.
			// In this case we assume there is an index.php file
			
			if ( is_dir( $template ) ) {
				$template = sprintf( '%sindex.php', $template );
			}
			$info = pathinfo( $template );
			
			return ( isset( $info['extension'] ) && 'php' === $info['extension'] );
		}
		
		/**
		 * Creates a console
		 *
		 * @param  array   $classes  additionnal classes     (optional)
		 * @param  array   $data
		 * @param  string  $style
		 * @param  string  $id       id                      (optional)
		 * @param  string  $content  console content         (optional)
		 * @param  array   $options  Additional options in the forms [key=> text, ... ]
		 *                           If an option is present, we show the right icon in the tool box withe
		 *                           the text as tooltip
		 *
		 *                  'log-live' => used to show console content in a maximzed modal
		 *
		 *                          [
		 *                          'text'   => tooltip text,
		 *                          'modal'  => associated modal id,
		 *                          'data' => [
		 *                              'log'=> log file,
		 *                              'title' => modal title,
		 *                               ],
		 *                          ]
		 *
		 *                   'recorder' => used to pause/play the scrolling of a console
		 *                          [
		 *                             'pause' => [
		 *                                  'action' => javascript method to call
		 *                                  'text'   => tooltip text
		 *                          ]
		 *                          [
		 *                             'play' => [
		 *                                  'action' => javascript method to call
		 *                                  'text'   => tooltip text
		 *                          ]
		 *
		 * @return string|false
		 * @access public
		 *
		 * @since  1.0
		 */
		public function add_console(
			array $classes = [], array $data = [], string $style = '', string $id = '', string $content = '',
			array $options = []
		)
		: string|false {
			ob_start();
			$addon = '';
			foreach ( $data as $name => $value ) {
				$addon = sprintf( ' data-%s="%s" ', $name, $value );
			}
			?>
            <console <?= $id !== '' ? sprintf( 'id="%s"', $id ) : '' ?><?= $style !== '' ? sprintf( ' style="%s"', $style ) : '' ?>
				<?= $addon ?> <?= count( $classes ) > 0 ? sprintf( '  class="%s"', implode( ' ', $classes ) ) : '' ?>>
                <console-body>
                    <console-text><?= $content ?></console-text>
                </console-body>
                <console-menu>
					
					<?php if ( isset( $options['log-live'] ) ) {
						$addon = '';
						if ( isset( $options['log-live']['modal'] ) ) {
							$addon = 'data-action="log-maximized" data-context="box" data-bs-target="#dashboard-modal" data-bs-toggle="modal"';
						}
						if ( isset( $options['log-live']['data'] ) ) {
							foreach ( $options['log-live']['data'] as $name => $value ) {
								$addon .= sprintf( ' data-%s="%s" ', $name, $value );
							}
						}
						?>
                        <button <?= $addon ?> class="console-maximize" title="<?= $options['log-live']['text'] ?>">
                            <i class="fa-regular fa-maximize"></i>
                        </button>
					<?php } ?>
					
					<?php if ( isset( $options['recorder'] ) ) {
						$addon = '';
						if ( isset( $options['recorder']['pause'] ) ) {
							$addon = sprintf( 'data-action="%s"', $options['recorder']['pause']['action'] );
						}
						?>
                        <button <?= $addon ?> class="console-pause" title="<?= $options['recorder']['pause']['text']
						?>">
                            <i class="fa-regular fa-pause"></i>
                        </button>
						<?php
						$addon = '';
						if ( isset( $options['recorder']['play'] ) ) {
							$addon = sprintf( 'data-action="%s"', $options['recorder']['play']['action'] );
						}
						?>
                        <button <?= $addon ?> class="console-play dsb-hide"
                                              title="<?= $options['recorder']['play']['text']
						                      ?>">
                            <i class="fa-regular fa-play"></i>
                        </button>
					<?php } ?>
                    <button class="console-copy" title="<?= _( 'Copy content to the clipboard' ) ?>">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <button class="console-erase" title="<?= _( 'Clear console' ) ?>">
                        <i class="fa-regular fa-eraser"></i>
                    </button>
                </console-menu>
            </console>
			<?php
			return ob_get_clean();
		}
	}
 