<?php

/**
 * Template Handler
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
if (!class_exists('DaTemplateHandlerClass')) {

    class DaTemplateHandlerClass
    {

        protected $plugin_path = '';
        protected $theme_path = '';

        public function set_paths($plugin_path = "", $theme_path = "")
        {
            $this->plugin_path = $plugin_path;
            $this->theme_path = $theme_path;
        }

        /**
         * Returns the template path.
         * It will check if the template exists in the theme folder, and then in the 
         *
         * @param string $template_name - The name of the template. With or without extension
         * @param string $subfolder - The subfolder of the plugin file
         * @param string $plugin_base - The base dir within the plugin folder
         * @param string $theme_base - The base dir of the theme folder
         * @return false|string False if the file does not exist, string with the complete file path
         */

        public function get_template_path(string $template_name = '', string $subfolder = '', $plugin_base = '', $theme_base = '')
        {

            //Check for valid extension
            $template_name_arr = explode('.', $template_name);
            $supported_extensions = ['php', 'html', 'js'];
            if (array_search(end($template_name_arr), $supported_extensions) === false) {
                //Adds the php extension if no extension found.
                $template_name .= '.php';
            }

            $plugin_base = (empty($plugin_base)) ?  $this->plugin_path : $plugin_base;
            $theme_base = (empty($theme_base)) ? $this->theme_path : $theme_base;

            //Adds slashes to the given paths
            if (!empty($subfolder) && substr($subfolder, -1) !== '/') {
                $subfolder .= '/';
            }
            if (!empty($plugin_base) && substr($plugin_base, -1) !== '/') {
                $plugin_base .= '/';
            }
            if (!empty($theme_base) && substr($theme_base, -1) !== '/') {
                $theme_base .= '/';
            }
            //Check if it exists in Template or Stylesheet dir   
            $file = locate_template($theme_base . $subfolder . $template_name, false);
            if ($file) {
                return $file;
            }

            $file = $plugin_base . $subfolder . $template_name;
            if (file_exists($file)) {
                return $file;
            }
            return false;
        }

        /**
         * Loads a template file and passes arguments
         * Echos out the result.
         *
         * @param string $template_name - Name of the file without extension
         * @param string $subfolder - Subfolder if any
         * @param mixed ...$template_args - Arguments of any type to pass to the template.
         * @return void
         * 
         */
        public function load_template(string $template_name = '', string $subfolder = '', ...$template_args)
        {
            echo $this->load_template_to_var($template_name, $subfolder, ...$template_args);
            return;
        }

        /**
         * Loads a template file and returns the output.
         *
         * @param string $template_name - Name of the file without extension
         * @param string $subfolder - Subfolder if any
         * @param array $paths - An array with the paths to the plugin folder and theme folder.
         * @param mixed ...$template_args - Arguments of any type to pass to the template.
         * @return string The template content or error message if template not found.
         * 
         * Template arguments:
         * - components/button
         * --link
         * --label
         * --target
         * --id
         * --class
         * -- data
         * - components/text-bar
         * -- text
         */
        public function load_template_to_var(string $template_name = '', string $subfolder = '', ...$template_args)
        {
            $args = get_defined_vars();
            $path =  $this->get_template_path($template_name, $subfolder);
            if ($path) {
                ob_start();
                include($path);
                $output_string = ob_get_contents();
                ob_end_clean();
                wp_reset_postdata();
                return $output_string;
            }

            return sprintf(__('Template "%s" not found!', 'da-template-handler'), (empty($path) ? $template_name : $path));
        }
    }
}
