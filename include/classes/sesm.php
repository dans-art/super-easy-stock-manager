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
        $this -> template_handler = new DaTemplateHandlerClass;
        $this -> template_handler -> set_paths(SESM_MAIN_DIR . 'templates', 'sesm/templates');

        $this->addActions();
        $this->add_shortcodes();
    }

    /**

     * Loads the Frontend Template

     *

     * @return void

     */

    public function getFrontend($use_style = true)

    {
        if ($use_style) {
            add_action('wp_head', function () {
                $style = (WP_DEBUG === true) ? 'sesm-main.css' : 'sesm-main.min.css';
                wp_enqueue_style('sesm-main-style', SESM_MAIN_URL . '/style/' . $style);
                wp_enqueue_style('sesm-fa', 'https://use.fontawesome.com/releases/v6.2.0/css/all.css');
            }, 10);
        }
        //Include the scripts
        add_action('wp_footer', function () {
            //Add variables for JS
            echo "<script type=\"text/javascript\">";
            echo "window.wp_site_url = \"" . site_URL() . "\"; ";
            echo "window.sesm_plugin_root = \"" . SESM_MAIN_URL . "\"";
            echo "</script>";

            $script = (WP_DEBUG === true) ? 'sesm-app.js' : 'sesm-app.min.js';
            wp_enqueue_script('sesm-main-script', SESM_MAIN_URL . '/scripts/' . $script, ['jquery'], true);
            wp_set_script_translations('sesm-main-script', 'sesm', SESM_MAIN_DIR . "languages");
        }, 10);
        return $this -> template_handler -> load_template_to_var('frontend');

        //$tmp = $this->getTemplate('frontend');

        //return $this->loadTemplate($tmp);
    }

    /**
     * Executes the main shortcode
     * @todo add capability check
     *
     * @return void
     */
    public function do_shortcode_sesm()
    {
        return $this->getFrontend(true);
    }


    /**

     * Main Method for handling the Ajax Calls

     *

     * @return string echoes the output of the ajax function

     */

    public function sesmAjax()

    {

        if (!current_user_can('edit_products')) {

            echo json_encode(array('template' => 'error', 'title' => __('Error','string'), 'error' => __('You are not allowed to edit products!', 'sesm')));

            exit();
        }

        $ajax = new Super_Easy_Stock_Manager_Ajax();

        $do =  isset($_REQUEST['do']) ? $_REQUEST['do'] : 'get_product';

        $sku = isset($_REQUEST['sku']) ? $_REQUEST['sku'] : '';

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
