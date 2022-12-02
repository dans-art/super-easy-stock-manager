<?php

/**
 * Plugin Name: Super Easy Stock Manager
 * Class description: Various helper methods.
 * Author: Dan's Art
 * Author URI: http://dev.dans-art.ch
 *
 */

class Super_Easy_Stock_Manager_Helper
{
    protected $version = '1.0';
    protected $scriptsLoaded = false;

    /**
     * Loads the translation of the plugin.
     * Located at: plugins/super-easy-stock-manager/languages/
     *
     * @return void
     */
    public function sesmLoadTextdomain()
    {
        load_textdomain('super-easy-stock-manager', SESM_MAIN_DIR . '/languages/super-easy-stock-manager-' . get_user_locale() . '.mo');
    }

    /**
     * Gets a file and transport some data to use.
     *
     * @param [type] $file
     * @param array $data
     * @return void
     */
    public function loadTemplate($file, $data = array())
    {
        ob_start();
        require($file);
        return ob_get_clean();
    }

    /**
     * Gets the Plugin Path. From the current Theme (/THEME/templates/) or from the Plugin
     * Structure is the same for plugin an theme
     *
     * @param  string $name - Name of the template file to load
     * @param  string $path - Path to the templates files. Default: templates/theme/
     * @return false on error, path on success
     */
    public function getTemplate($name, $path = 'templates/theme/')
    {
        return SESM_MAIN_DIR . '/templates/theme/' . $name . '.php';
    }

    /**
     * Adds the Actions to WP to load Textdomain and register ajax
     *
     * @return void
     */
    public function addActions()
    {
        //load language 
        add_action('init', [$this, 'sesmLoadTextdomain']);
        //register Ajax
        add_action('wp_ajax_sesm-ajax', [$this, 'sesmAjax']);
        add_action('wp_ajax_nopriv_sesm-ajax', [$this, 'sesmAjax']);
    }
    public function add_shortcodes()
    {
        add_shortcode('sesm', [$this, 'do_shortcode_sesm']);
    }
        /**
     * Loads the current plugin version.
     */
    public function load_version()
    {
        if (!function_exists('get_file_data')) {
            return 000;
        }
        $plugin_meta = get_file_data(SESM_MAIN_DIR . 'super-easy-stock-manager.php', array('Version'), 'plugin');
        return (!empty($plugin_meta[0])) ? $plugin_meta[0] : "001";
    }
}
