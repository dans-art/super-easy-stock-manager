<?php

/**
 * Plugin Name: Super Easy Stock Manager
 * Class description: Main Class.
 * Author: Dan's Art
 * Author URI: http://dev.dans-art.ch
 *
 */
class Super_Easy_Stock_Manager extends Super_Easy_Stock_Manager_Helper
{

    /**
     * Adds the Ajax Functions
     * Enqueues Scripts
     */
    public $template_handler = null;
    public function __construct()
    {
        //Set paths for the template handler
        $this->template_handler = new DaTemplateHandlerClass;
        $this->template_handler->set_paths(SESM_MAIN_DIR . 'templates', 'sesm/templates');
        $this->addActions();
        $this->add_shortcodes();
        $this->enqueue_script_n_styles();
    }
    /**
     * Enqueues the scripts and styles for the super easy stock manager
     *
     * @param bool $use_style
     * @return void
     */
    public function enqueue_script_n_styles($use_style = true)
    {
        //Add the scripts
        add_action('wp_enqueue_scripts', function () {
            $script = (WP_DEBUG === true) ? 'sesm-app.js' : 'sesm-app.min.js';
            //$script = 'sesm-app.js'; //@todo: Change on production
            $version = $this->load_version();
            wp_enqueue_script('sesm-main-script', SESM_MAIN_URL . 'scripts/' . $script, ['jquery', 'wp-i18n'], $version, true);
            wp_enqueue_script('sesm-scanner-script', SESM_MAIN_URL . 'include/lib/html5-qrcode.min.js', [], $version, true);
            wp_set_script_translations('sesm-main-script', 'super-easy-stock-manager', SESM_MAIN_DIR . "languages");
        }, 10);
        //Add the styles
        if ($use_style) {
            add_action('wp_head', function () {
                $style = 'sesm-main.css';
                $version = $this->load_version();
                wp_enqueue_style('sesm-main-style', SESM_MAIN_URL . 'style/' . $style, [], $version);
                wp_enqueue_style('sesm-fa', 'https://use.fontawesome.com/releases/v6.2.0/css/all.css');
            }, 10);
        }
    }

    /**
     * Loads the Frontend Template
     *
     * @return void
     */
    public function getFrontend($use_style = true)
    {
        //Include the footer scripts
        add_action('wp_footer', function () {
            //Add variables for JS
            echo "<script type=\"text/javascript\">";
            echo "window.wpSiteUrl = \"" . site_URL() . "\"; ";
            echo "window.sesm_plugin_root = \"" . SESM_MAIN_URL . "\"";
            echo "</script>";
        }, 10);

        return $this->template_handler->load_template_to_var('frontend');
    }
    /**
     * Executes the main shortcode
     * @todo add capability check
     *
     * @return void
     */
    public function do_shortcode_sesm()
    {
        if (!current_user_can('edit_products')) {
            return __('You are not allowed to edit products. Please contact the system administrator and request the required rights.', 'super-easy-stock-manager');
        }
        if (!function_exists('wc_get_product_id_by_sku')) {
            return __('WooCommerce seems not to be installed. Please Install or activate WooCommerce to use this plugin', 'super-easy-stock-manager');
        }
        return $this->getFrontend(true);
    }

    /**
     * Main Method for handling the Ajax Calls
     *
     * @return string echoes the output of the ajax function
     */
    public function sesmAjax()
    {
        $ajax = new Super_Easy_Stock_Manager_Ajax();
        if (!is_user_logged_in()) {
            echo $ajax->errorJson(__('You are not logged in. Please sign-in to use this function', 'super-easy-stock-manager'));
            exit();
        }
        if (!function_exists('wc_get_product_id_by_sku')) {
            echo $ajax->errorJson(__('WooCommerce seems not to be installed. Please Install or activate WooCommerce to use this plugin', 'super-easy-stock-manager'));
            exit();
        }
        if (!current_user_can('edit_products')) {
            echo $ajax->errorJson(__('You are not allowed to edit products!', 'super-easy-stock-manager'));
            exit();
        }
        $do =  isset($_REQUEST['do']) ? sanitize_file_name($_REQUEST['do']) : 'get_product';
        $sku = isset($_REQUEST['sku']) ? wp_kses($_REQUEST['sku'], []) : '';
        $sku = htmlspecialchars($sku);
        switch ($do) {
            case 'get_product':
                echo $ajax->getProduct($sku);
                break;
            case 'add_quantities':
                echo $ajax->updateProduct('stock', $sku);
                break;
            case 'update_price':
                echo $ajax->updateProduct('price', $sku);
                break;
        }
        exit();
    }
}
