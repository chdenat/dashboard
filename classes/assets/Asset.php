<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : Asset.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/24/22, 3:47 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	namespace dashboard\assets;
	
	class Asset {
		
		const FILE          = 0;
		const INLINE        = 1;
		const PHP2JS        = 3;
		const MODULE        = 4;
		const INLINE_MODULE = 5;
		
		const AFTER  = 0;
		const BEFORE = 1;
		
		const JS  = 'js';
		const CSS = 'css';
		
		/** @var mixed file $handle */
		public string $handle;
		/** @var string  file name or asset content */
		public string $content = '';
		/** @var array of dependencies (hacles list) */
		public array $deps;
		/** @var int type of asset, ie FILE|INLINE|PHP2JS */
		public int $type;
		/** @var bool registration flag */
		public bool $registered;
		/** @var bool print flag */
		public bool $printed;
		/** @var bool footer */
		public bool $footer;
		/** @var string extension CSS|JS */
		public string $ext;
		/** @var int position AFTER|BEFORE */
		public int $position;
		
		/**
		 * Constructor
		 *
		 * @param  array  $args  [handle, content,deps,type,registered, hooked,ext,footer,position]
		 *
		 * @access  public
		 * @since   1.0
		 */
		public function __construct( array $args ) {
			$this->handle     = $args['handle'];
			$this->content    = $args['content'] ?? '';
			$this->deps       = $args['deps'] ?? [];
			$this->type       = $args['type'] ?? self::FILE;
			$this->registered = $args['registered'] ?? false;
			$this->printed    = $args['hooked'] ?? false;
			$this->ext        = $args['ext'] ?? "css";
			$this->footer     = $args['footer'] ?? false;
			$this->position   = $args['position'] ?? self::AFTER;
		}
		
		/**
		 * Register an asset
		 *
		 * @return void
		 */
		public function register()
		: void {
			$this->registered = true;
		}
		
		/**
		 * Checks if registered
		 *
		 * @return bool registration status
		 */
		public function is_registered()
		: bool {
			return $this->registered;
		}
		
		/**
		 * Unregister an asset
		 *
		 * @return void
		 */
		public function unregister()
		: void {
			$this->registered = false;
			$this->printed    = true;
		}
		
		/**
		 * Set printed status
		 *
		 * @return void
		 */
		public function mark_as_printed()
		: void {
			$this->printed = true;
		}
		
		/**
		 * Get printed status
		 *
		 * @return bool
		 */
		public function is_printed()
		: bool {
			return $this->printed;
		}
		
		/**
		 * Get type (FILE|INLINE|PHP2JS)
		 *
		 * @return int the type
		 */
		public function get_type()
		: int {
			return $this->type;
		}
		
		/**
		 * Get file name if type is FILE or content
		 *
		 * @return string
		 */
		public function get_content()
		: string {
			return $this->content;
		}
		
		/**
		 * Add a new dependency
		 *
		 * @param  string  $dep  dependency to add
		 *
		 * @return void
		 */
		public function add_dependency( string $dep )
		: void {
			$this->deps[] = $dep;
		}
		
		/**
		 * Replace existing dependencies
		 *
		 * @param  array  $deps  new dependencies
		 *
		 * @return void
		 */
		public function replace_dependencies( array $deps )
		: void {
			$this->deps = $deps;
		}
		
		/**
		 * Get all the dependencies
		 *
		 * @return array
		 */
		public function get_dependencies()
		: array {
			return $this->deps;
		}
		
		/**
		 * Get position (AFTER|BEFORE) of an inline asset
		 *
		 * @return int
		 */
		public function get_position()
		: int {
			return $this->position;
		}
		
		/**
		 * Check if an asset is in footer or not
		 *
		 * @return bool
		 */
		public function in_footer()
		: bool {
			return $this->footer;
		}
	}