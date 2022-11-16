<?php
/**
 * Plugin Name: Super Easy Stock Manager
 * Description: Stock Management with ease!
 * Version: 1.1
 * Author: Dan's Art
 * Author URI: http://dev.dans-art.ch
 * Text Domain: sesm
 * License: GPLv2 or later
 *
 */


/**
 * Load the classes and tools
 */
require_once('plugins/da-template-handler.php');
require_once('include/tools/sesm-helper.php');
require_once('include/classes/sesm.php');
require_once('include/classes/sesm-ajax.php');

//Define constants
define('SESM_MAIN_DIR', plugin_dir_path( __FILE__ ));
define('SESM_MAIN_URL', plugin_dir_url( __FILE__ ));

$sesm = new Super_Easy_Stock_Manager();