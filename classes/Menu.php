<?php

/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Menu.php                                                                                                    *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 30/07/2023  16:22                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

namespace dashboard;

use dashboard\template\Template;
use dashboard\user\SessionManager;

class Menu {
    /**
     * @var array|mixed
     */
    private static array $menu;
    private static string $json;
    /**
     * @var Menu|null
     */
    private static ?Menu $instance = null;
    private int $chapter = 0;


    private function __construct() {
        // We retrieve the menu
        self::read_json();
        self::$menu = json_decode(self::$json, true);
    }

    /**
     * It's a Singleton , this method is used to retrieve the instance
     *
     * @return Menu
     *
     * @since  1.0
     *
     */
    public static function instance(): Menu {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Retrieve menu array
     *
     * @return array
     *
     * @since  1.0
     *
     * @access public
     */
    public static function get_menu(): array {
        return self::$menu;
    }

    /**
     *
     * Read teh JSON menu file located in templates dire
     *
     * @return void
     */
    public function read_json() {
        self::$json = file_get_contents(Template::instance()->locate_template('menu', 'json'));
    }

    /**
     * Retrieve json string
     *
     * @return string
     *
     * @since  1.0
     *
     * @access public
     */
    public static function get_json(): string {
        return self::$json;
    }

    /**
     *
     * Render menu in HTML
     *
     * @return string
     *
     * @since  1.0
     *
     * @access private
     */
    public function render_html(): string {
        ob_start();
        $level = 0;
        ?>
        <ul id="menu-wrapper" class="dsb-scroll">
            <?php foreach (self::$menu['menu'] as $item) { ?>
                <?= $this->show_level($item, ++$level) ?>
            <?php } ?>
        </ul>
        <?php

        return ob_get_clean();
    }

    /**
     *
     * @param $item
     * @param $roles
     *
     * @return bool
     */
    private function can_use_item($item, $roles): bool {
        if (isset($item['roles'])) {
            // roles can be array or a comm delimited string
            if (!is_array($item['roles'])) {
                $item['roles'] = explode(',', $item['roles']);
            }

            // Id the session is active and at least one role matches the list, it's ok
            return (SessionManager::instance()->active() && !empty(array_intersect($roles, $item['roles'])));
        }

        return true;
    }

    /**
     * Localisation of menu text, base on text or lang[CURRENT_LANG]
     * @param $item
     *
     * @return string
     *
     * @since 1.1.0
     *
     */
    private function localize_item($item): string {
        return $item['lang'][CURRENT_LANG] ?? ($item['text'] ?? '');
    }

    private function show_level($item, $level = 1, $id = 'menu-item', $roles = ['logged']) {
        ob_start();
        $sub_level = 0;

        $hidden = ($item['hidden'] ?? false) ? 'class="dsb-hide"' : '';
        $visible = !($item['hidden']) ?? true;

        if ($this->can_use_item($item, $roles)) {

            if (isset($item['children'])) {
                // Any children ? it is a new level, we print head
                $id = sprintf('%s-%d', $id, $level++);
                if ($visible) { ?>
                    <li <?= $hidden ?>>
                        <a href="#<?= $id ?>" data-bs-toggle="collapse" aria-expanded="false">
                            <?= $item['icon'] ?? '' ?>
                            <span><?= $this->localize_item($item) ?></span>
                        </a>

                        <ul class="collapse multi-collapse" id="<?= $id ?>">
                            <?php
                            foreach ($item['children'] as $child) { ?>
                                <?= $this->show_level($child, ++$sub_level, $id, $roles); ?>
                            <?php } ?>
                        </ul>
                    </li>
                    <?php
                }
            } else {

                // It's an item, we create it
                $default = ($item['default'] ?? false) ? 'data-default-page' : '';
                $href = ($item['href'] ?? false) ? sprintf('href="%s"', $item['href']) : '';
                $data_content = (($item['href'] ?? false)) ? 'data-content' : '';
                $dataset = [];
                $item['dataset'] = $item['dataset'] ?? [];
                $item['dataset']['level'] = sprintf('%s-%d', $id, $level);

                // No data force => we force it to false if it is a link to display in #content#
                if (!empty($data_content) && !in_array('force-reload', array_keys($item['dataset']))) {
                    $item['dataset']['force-reload'] = 'false';
                }
                // Create the dataset
                foreach ($item['dataset'] as $key => $value) {
                    $dataset[] = sprintf('data-%s="%s" ', $key, $value);
                }
                if ($visible) { ?>
                    <li <?= $hidden ?>>
                        <a <?= $data_content ?> <?= $href ?> <?= $default ?> <?= implode(' ', $dataset)
                        ?>>
                            <?= $item['icon'] ?? '' ?>
                            <span><?= $this->localize_item($item) ?></span>
                        </a>
                    </li>
                    <?php
                }
            }
        }

        return ob_get_clean();
    }
}