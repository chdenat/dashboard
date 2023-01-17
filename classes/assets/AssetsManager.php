<?php
/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : Assets.php
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

namespace dashboard\assets;

use dashboard\Debug;
use dashboard\hooks\Hooks;
use dashboard\template\Template;
use phpseclib3\Net\SFTP;


class AssetsManager
{

    /**
     * @var null|\dashboard\assets\AssetsManager
     * @access private
     * @static
     */
    private static ?AssetsManager $instance = null;

    /**
     * List of CSS assets to be inserted
     *
     * @var array of Assets
     */
    private array $css_files;
    /**
     * List of JS assets to be inserted in the header
     *
     * @var array of Assets
     */
    private array $js_header;
    /**
     * List of JS assets to be inserted in the footer
     *
     * @var array of Assets
     */
    private array $js_footer;
    /**
     * @var bool pass to register to knox the origine, hook or direct
     */
    private bool $from_hook = false;

    /**
     * Constructor
     */
    private function __construct()
    {
        $this->css_files = [];
        $this->js_footer = [];
        $this->js_header = [];
    }

    /**
     * It's a Singleton , this method is used to retrieve the instance
     *
     * @return AssetsManager
     *
     * @since  1.0
     *
     */
    public static function instance(): AssetsManager
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Register CSS file
     *
     * This function register any CSS assets
     *
     * Print can be done two ways :
     *  - on sortedpective hook, here template/head/end
     *  - directly here CSS has benn already printed (hooked)
     *
     * @param string $handle asset identification
     * @param string $file CSS file path
     * @param array $deps list of depencies (handles)
     *
     * @return void
     * @access  public
     *
     * @since   1.0
     */
    public function add_to_css_list(string $handle, string $file, array $deps = [], $type = PAGE): void
    {
        /**
         * CSS could be already hooked by another register call.
         * In this case we print the tag directly.
         * (it should be embedded in a template)
         */

        if (!isset($this->css_files[$handle])) {
            $this->css_files[$handle] = new Asset([
                'handle' => $handle,
                'ext' => Asset::CSS,
                'content' => $file,
                'deps' => $deps,
            ]);
            $this->css_files[$handle]->register();
            // Blocks CSS are printed just after registration
            if ($type === BLOCK) {
                $this->print_css_tag_direct($handle);
            }
        } else {
            $this->css_files[$handle]->register();
            $this->print_css_tag_direct($handle);
        }
    }

    /**
     * Register CSS inline
     *
     * This function register any inline CSS assets
     *
     * Print can be done two ways :
     *  - on sortedpective hook, here template/head/end
     *  - directly here CSS has benn already printed (hooked)
     *
     * @param string $handle asset identification
     * @param string $content CSS content
     * @param array $deps dependencies
     *
     * @return void
     * @access public
     *
     * @throws \JsonException
     * @since  1.0
     */
    public function add_inline_css(string $handle, string $content, array $deps): void
    {
        /**
         * CSS could be already hooked by another register call.
         * In this case we print the tag directly.
         * (it should be embedded in a template)
         */
        $handle .= '-inline';

        if (!isset($this->css_files[$handle])) {
            $this->css_files[$handle] = new Asset([
                'handle' => $handle,
                'content' => $content,
                'type' => Asset::INLINE,
                'deps' => $deps,
            ]);
            $this->css_files[$handle]->register();
        } else {
            $this->css_files[$handle]->register();
            $this->print_css_tag_direct($handle);
        }
    }

    /**
     * Print CSS files
     *
     * @return string|false
     * @access  public
     *
     *
     * @since   1.0
     *
     */
    public function print_all_css_assets(): string|bool
    {

        $this->from_hook = true;
        Hooks::instance()->do_action('assets/register-css');

        ob_start();
        echo Template::instance()->comments('CSS assets');
        foreach ($this->sort_by_dependencies($this->css_files) as $handle => $asset) {
            if (!($asset->is_printed())) {
                echo $this->print_css_tag($handle, $asset);
                $this->css_files[$handle]->mark_as_printed();
            }
        }
        echo Template::instance()->end_comments();
        $this->from_hook = false;

        return ob_get_clean();
    }

    /**
     * Used to print a CSS tag
     *
     * @param string $handle
     * @param \dashboard\assets\Asset $asset
     *
     * @return bool|string
     * @access private
     *
     * @since  1.0
     */
    private function print_css_tag(string $handle, Asset $asset): bool|string
    {
        ob_start();

        switch ($asset->get_type()) {
            case Asset::FILE:
                ?>
                <link rel="stylesheet" id="<?= dsb_slugify($handle) ?>-css" type="text/css"
                      href="<?= $this->_beautify_url($asset->get_content()) ?>"
                      media="screen"/>
                <?php
                break;
            case Asset::INLINE: ?>
                <style id="<?= $handle ?>-css"><?= $asset->get_content() ?></style>
                <?php
                break;
        }

        return ob_get_clean();
    }


    /**
     * If URI contains //, we change it to /
     *
     * @param string $url
     *
     * @return null|string
     * @access private
     *
     * @since  1.0
     */
    private function _beautify_url(string $url): ?string
    {
        return (string)preg_replace('/([^:])(\/{2,})/', '$1/', $url);
    }

    /**
     * This function checks if a CSS tag registration has been done outside any hook
     * and if it is the case, print a tag.
     *
     * @param string $handle
     *
     * @return void
     * @access private
     *
     * @since  1.0
     *
     */
    private function print_css_tag_direct(string $handle): void
    {

        if (!$this->from_hook && $this->css_files[$handle]->is_registered() && !$this->css_files[$handle]->is_printed()) {
            echo $this->print_css_tag($handle, $this->css_files[$handle]);
        }
        $this->css_files[$handle]->register();
        $this->css_files[$handle]->mark_as_printed();
    }

    /**
     * Print a CSS asset where it was called.
     *
     * Could be used in block to add some piece of CSS code
     *
     * @param string $file
     *
     * @return void
     * @access  public
     *
     * @since   1.0
     *
     */
    public function print_css_asset(string $file): void
    {
        ob_start();
        ?>
        <link rel="stylesheet" type="text/css" href="<?= $this->_beautify_url($file) ?>" media="screen"/>
        <?php
        echo ob_get_clean();
    }

    /**
     * Register JS file
     *
     * @param string $handle asset identification
     * @param string $file JS file path
     * @param array $deps Dependencies
     * @param bool $footer default : true
     * @param int $type (FILE|MODULE|PHP2JS|INLINE|INLINE_MODULE default FILE (ie TEXT/JAVASCRIP)
     *
     * @return void
     * @access public
     *
     * @since  1.0
     */
    public function add_to_js_list(
        string $handle, string $file, array $deps, bool $footer = true, int $type = Asset::FILE
    ): void
    {
        $this->_add_to_js_list(new Asset([
            'handle' => $handle,
            'ext' => Asset::JS,
            'content' => $file,
            'deps' => $deps,
            'type' => $type,
            'footer' => $footer,
        ]));
    }

    /**
     * Deregister a JS asset
     *
     * @param string $handle asset identification
     * @param bool $footer from footer (true) or header list
     *
     * @return null|\dashboard\assets\Asset
     * @access public
     *
     * @since  1.0
     *
     */
    public function remove_from_js_list(string $handle, bool $footer = true): ?Asset
    {
        $asset = null;
        if ($footer) {
            if (array_key_exists($handle, $this->js_footer)) {
                $asset = $this->js_footer [$handle];
                unset ($this->js_footer [$handle]);
            }
        } elseif (array_key_exists($handle, $this->js_header)) {
            $asset = $this->js_header [$handle];
            unset ($this->js_header [$handle]);
        }
        // We synchronise the statuses for the returned asset.
        $asset?->unregister();

        return $asset;
    }

    /**
     * Register JS file inline
     *
     * @param string $handle base asset identification
     * @param string $content JS content
     * @param array $deps dependencies
     * @param bool $before insert iline script after(false) or before(true) the assets,
     *                           if handle already
     *                           exists
     *                           default : false
     * @param bool $footer default : true
     * @param array $php2js PHP array that we'll pass to JS object.
     *
     * @return void
     * @access public
     *
     * @since  1.0
     */
    public function add_inline_js(
        string $handle, string $content = '', array $deps = [],
        bool   $before = false, bool $footer = true,
        array  $php2js = []
    ): void
    {
        /**
         * inline JS could be enqueued before or after any existing $handle
         *
         * ie: if a inline JS file with handle <handle> could be inserted
         *     before any already enqueued <handle> JS file or
         *     after any already <handle> JS file. This is the default behavior
         *
         * handle will be saved as <handle>-inline to avoid conflict with existing <handle>
         */
        $before = ($before) ? Asset::BEFORE : Asset::AFTER;
        $in_handle = $handle . '-inline';
        if ($before === Asset::BEFORE) {
            // Before : In this case, the parent should be dependent of the inline JS.
            // 1- we unregister it, returns null if does not exist.
            $parent = $this->remove_from_js_list($handle, $footer);
            if (null !== $parent) {
                // 2- we reset dependencies
                // - inline will have parent dependencies
                // - parent will be dependent of inline
                $deps = [...$parent->get_dependencies()];

                $parent->replace_dependencies([$in_handle]);

                // 3- we re register-it
                $this->_add_to_js_list(new Asset([
                    'handle' => $handle,
                    'ext' => Asset::JS,
                    'content' => $parent->get_content(),
                    'deps' => $parent->get_dependencies(),
                    'type' => Asset::FILE,
                    'footer' => $footer,
                ]));
            }
        } else {
            // After : we add the ref handle into dependencies
            $deps[] = $handle;
        }

        $this->_add_to_js_list(new Asset([
            'handle' => $in_handle,
            'ext' => Asset::JS,
            'content' => $this->php2js($php2js) . $content,
            'deps' => $deps,
            'type' => Asset::INLINE,
            'footer' => $footer,
        ]));
    }

    /**
     * Passes PHP arrays to JS objects
     *
     * @param array $var PHP array passed to JS objects
     *
     *                     Array must be in the form ['<object_name>' = [...],...]
     * @param bool $add_tag if true,, add script tag
     *
     * @return string
     * @access public
     *
     * @since  1.0
     */
    public function php2js(array $var, bool $add_tag = false): string
    {
        $text = '';
        ob_start();

        if (!empty($var)) {
            echo '// ---------------------- data passed from PHP -------' . PHP_EOL;
            if ($add_tag) {
                echo '<script>';
            }
            foreach ($var as $name => $value) {
                try {
                    echo 'var ' . $name . '=' . json_encode($value, JSON_THROW_ON_ERROR) . ';' . PHP_EOL;
                } catch (\JsonException $exception) {
                    echo '// Error: ' . $exception->getMessage() . '\n';
                }
            }
            echo '// ---------------------- ---- ------ ---- --- -------' . PHP_EOL;
        }

        return ob_get_clean();

    }

    /**
     * function used to register JS Assets
     *
     * JS could be already hooked by another register call.
     * In this case we print the tag directly.
     * (it should be embedded in a template)
     *
     * @param \dashboard\assets\Asset $asset
     *
     * @return void
     * @access private
     *
     * @since  1.0
     */
    private function _add_to_js_list(Asset $asset): void
    {
        if ($asset->in_footer()) {
            if (!isset($this->js_footer[$asset->handle])) {
                $this->js_footer[$asset->handle] = $asset;
            }
            /**
             * For the footer there is no possibility to print it directly as it has registered and will be hooked
             * at the end, so we mark it as registered then we continue.
             */
            $this->js_footer[$asset->handle]->register();
        } else {
            if (!isset($this->js_header[$asset->handle])) {
                $this->js_header[$asset->handle] = $asset;
            }
            if (!$this->from_hook && !$asset->is_registered() && !$asset->is_printed()) {
                echo Template::instance()->comments('JS direct ');
                echo $this->print_js_tag($asset->handle, $asset);
            }
            $this->js_header[$asset->handle]->register();
        }
    }

    /**
     * Print JS file in header or at the head of the body
     *
     * @param bool $footer enqueue at the end of the body if true, else at the end of head tag.
     *
     * @return string|false
     * @access public
     *
     * @since  1.0
     *
     */
    public function print_all_js_assets(bool $footer = true): string|bool
    {

        $this->from_hook = true;
        Hooks::instance()->do_action('assets/register-js');

        $assets = ($footer) ? $this->js_footer : $this->js_header;
        ob_start();
        echo Template::instance()->comments('JS assets ' . (($footer) ? 'footer' : 'header'));
        foreach ($this->sort_by_dependencies($assets) as $handle => $asset) {
            echo $this->print_js_tag($handle, $asset);
            if ($footer) {
                $this->js_footer[$handle]->mark_as_printed();
            } else {
                $this->js_header[$handle]->mark_as_printed();
            }
        }
        echo Template::instance()->end_comments();

        $this->from_hook = false;

        return ob_get_clean();
    }

    /**
     * Used to print the script tag
     *
     * @param string $handle
     * @param \dashboard\assets\Asset $asset
     *
     * @return false|string
     * @access  private
     *
     * @since   1.0
     */
    private function print_js_tag(string $handle, Asset $asset): bool|string
    {
        ob_start();
        switch ($asset->get_type()) {
            case Asset::FILE:
                ?>
                <script id="<?= dsb_slugify($handle) ?>-js"
                        src="<?= $this->_beautify_url($asset->get_content()) ?>"
                        type="text/javascript">
                </script>
                <?php
                break;
            case Asset::MODULE:
                ?>
                <script id="<?= dsb_slugify($handle) ?>-js"
                        src="<?= $this->_beautify_url($asset->get_content()) ?>"
                        type="module">
                </script>
                <?php
                break;
            case Asset::INLINE: ?>
                <script id="<?= dsb_slugify($handle) ?>-js" type="text/javascript"><?= $asset->get_content()
                    ?></script>
                <?php
                break;
            case Asset::INLINE_MODULE: ?>
                <script id="<?= dsb_slugify($handle) ?>-js" type="module"><?= $asset->get_content()
                    ?></script>
                <?php
                break;
        }

        return ob_get_clean();
    }

    /**
     * Print a JS asset where it was called.
     *
     * Could be used in block to add some piece of JS code
     *
     * @param string $file
     *
     * @return void
     * @access  public
     *
     * @since   1.0
     *
     */
    public function print_js_asset(string $file, $type = "text/javascript"): void
    {
        ob_start();
        ?>
        <script type="<?= $type ?>" src="<?= $file ?>" charset="UTF-8"></script>
        <?php
        echo ob_get_clean();
    }

    public function print_js_import(string $module, string $file): void
    {
        ob_start();
        ?>
        <script type="module" charset="UTF-8">
            import {<?= $module ?>} from

            <?=$file?>;
            <?= $module ?>.init()
        </script>
        <?php
        echo ob_get_clean();
    }


    /**
     * Print JS in header
     *
     * @return string|bool
     * @access public
     *
     * @since  1.0
     *
     */
    public function print_all_js_assets_header(): string|bool
    {
        return $this->print_all_js_assets(false);
    }

    /**
     * Print JS in footer (at the end of body)
     *
     * @return string|bool
     * @access public
     *
     * @since  1.0
     *
     */
    public function print_all_js_assets_footer(): string|bool
    {
        return $this->print_all_js_assets();
    }

    /**
     * Topological Sort of assets (ie by dependencies).
     *
     * For each asset, we check the dependencies and place files accorfdingly.
     *
     * based on : https://stackoverflow.com/questions/39711720/php-order-array-based-on-elements-dependency
     *
     * @param array $assets : array of Assets
     *
     * @return array : the sorted $assets array
     *
     * @access private
     *
     * @since  1.0
     */
    private function sort_by_dependencies(array $assets): array
    {

        // Bails early if empty
        if (empty($assets)) {
            return $assets;
        }
        $sorted = [];
        $done_list = [];

        /**
         * We prepare the sort of the assets. We delete assets that have no valid dependencies
         * to avoid infinite loop.
         *
         * @since 1.0
         *
         */

        foreach ($assets as $handle => $asset) {
            foreach ($asset->get_dependencies() as $dep) {
                if (empty($assets[$dep])) {
                    unset($assets[$handle]);
                }
            }
        }

        /**
         * Main loop : until all assets dependencies are resolved
         *
         */

        while (count($assets) > count($sorted)) {
            $some_resolved = false;

            foreach ($assets as $handle => $asset) {
                if (isset($done_list[$handle])) {
                    // item already in  result set
                    continue;
                }
                $resolved = true;

                if (!empty($asset->get_dependencies())) {
                    foreach ($asset->get_dependencies() as $dep) {
                        if (!isset($done_list[$dep])) {
                            // there is a dependency that is not met:
                            $resolved = false;
                            break;
                        }
                    }
                }
                if ($resolved) {
                    //all dependencies are met:
                    $done_list[$handle] = true;
                    $sorted[$handle] = $asset;
                    $some_resolved = true;
                }
            }
            if (!$some_resolved) {
                echo '<!-- Unresolvable dependency -->';
            }
        }

        return $sorted;
    }

    /**
     * Checks if  CSS and/or JS assets file exists for a template.
     *
     * We first scan the template assets directories to find the file.
     * If it exists, we return its URL.
     *
     * If non assets are existing, we return false.
     *
     * @param string $template for which we'll try to locate
     * @param string $type template type  BLOCK|PAGE (PAGE by default)
     *
     * @return bool|array   the array with the assets urls or false
     * @access  public
     *
     * @since   1.0
     */
    public function locate_template_assets(string $template, string $type = PAGE): bool|array
    {

        $assets_urls = false;
        $type .= 's/';
        // We scan directories
        foreach (TEMPLATE_ASSETS['dir'] as $key => $type_assets) {
            $c = 0;
            foreach ($type_assets as $type_asset) {
                if (file_exists($type_asset . $type . $template . '.' . $key)) {
                    $assets_urls[$key] = TEMPLATE_ASSETS['url'][$key][$c++] . $type . $template . '.' . $key;
                    break;
                }
            }
        }

        return $assets_urls;

    }
    public static function add_exported_js($data)
    : void {

        ob_start();
        if ( ! empty( $data ) ) { ?>
            <!-- passed from PHP -->
            <script>
                <?php foreach ( $data as $name => $value ) { ?>
                const php_get_<?= $name ?> = ()=>{return JSON.parse('<?=json_encode( $value )?>')}
                <?php } ?>
            </script>
        <?php }

        echo ob_get_clean();
    }


    public static function add_import_map(): void
    {
        ob_start();
        ?>
        <script type="importmap">
            <?php
            $json = [];
            foreach ([D_ASSETS_DIR, C_ASSETS_DIR] as $dir) {
                if (file_exists($dir . 'import-map.json')) {
                    $import = json_decode(file_get_contents($dir . 'import-map.json'), true);
                    foreach ($import['imports'] as $key => $value) {
                            $json['imports'][$key]=$value;
                    }
                }
            }
            echo json_encode($json,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES)

            ?>


        </script>


        <?php echo ob_get_clean();
    }

}
 
 