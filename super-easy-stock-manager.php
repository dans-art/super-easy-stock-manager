<?php

/**
 * Plugin Name: Super Easy Stock Manager
 * Description: Stock Management with ease!
 * Version: 1.3
 * Stable tag: 1.3
 * Author: Dan's Art
 * Author URI: http://dev.dans-art.ch
 * Donate link: https://paypal.me/dansart13
 * 
 * Contributors: dansart
 * Contributors URL: http://dev.dans-art.ch
 * Tags: woocommerce, stock, management, tools, helper
 * 
 * Requires PHP: 7.4
 * 
 * Requires at least: 5.4.0
 * Tested up to: 5.9
 *
 * Text Domain: sesm
 * Domain Path: /languages
 * License: GPLv2 or later
 *
 * @todo: Check if woocommerce is installed
 * @todo: Add read only function for visitors?
 * @todo: Add options menu in backend -> About the plugin, how to setup and Donation
 * 
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Load the classes and tools
 */
require_once('plugins/da-template-handler.php');
require_once('include/tools/sesm-helper.php');
require_once('include/classes/sesm.php');
require_once('include/classes/sesm-ajax.php');

//Define constants
define('SESM_MAIN_DIR', plugin_dir_path(__FILE__));
define('SESM_MAIN_URL', plugin_dir_url(__FILE__));

$sesm = new Super_Easy_Stock_Manager();
