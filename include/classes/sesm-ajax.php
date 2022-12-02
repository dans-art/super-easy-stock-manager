<?php

/**
 * Plugin Name: Super Easy Stock Manager
 * Class description: The Ajax functions. Saves Porducts to the database.
 * Author: DansArt.
 * Author URI: http://dev.dans-art.ch
 *
 */
class Super_Easy_Stock_Manager_Ajax
{
    /**
     * Reads out a Product from the Database
     *
     * @param string $sku - Sku of product
     * 
     * @return string json fromated string
     */
    public function getProduct($sku)
    {
        $product = $this->loadProduct($sku);
        $result = array('template' => 'get', 'sku' => $sku);
        if (is_object($product)) {
            $product_infos = $this->get_product_infos($product);
            $return_data = array_merge($result, $product_infos);
            return json_encode($return_data);
        }
        return json_encode($product);
    }
    /**
     * Gets all the basic product infos. Like price, stock, title,...
     *
     * @param object $product
     * @return array
     */
    public function get_product_infos($product)
    {
        $result = [];
        if (is_object($product)) {
            $type = $product->get_type();
            $result['post_type'] = $this->getProductType($type);
            $result['title'] = $product->get_name();
            $result['stock_quantity'] = $product->get_stock_quantity() ?: "-";
            $result['price'] = $product->get_price() ?: "-";
            $result['currency'] = get_woocommerce_currency();
            $result['regular_price'] = $product->get_regular_price() ?: "-";
            $result['sale_price'] = $product->get_sale_price() ?: false;
            $result['description'] = substr($product->get_short_description(), 0, 250);
            $result['image'] = $product->get_image('thumbnail');
            $result['weight'] = $product->get_weight() ?: 0;
            $result['attributes'] = wc_get_formatted_variation($product, true);
        }
        return $result;
    }
    /**
     * Updates a Product
     *
     * @param string $action - Action to do. Valid options: price, stock
     * @param string $sku - SKU of a product
     * 
     * @return void
     */
    public function updateProduct($action, $sku)
    {
        $result = array('sku' => $sku);
        $product = $this->loadProduct($sku);
        if (is_object($product)) {
            if ($product->get_type() === 'variable') {
                $result['template'] = 'error';
                $result['title'] = __('Warning', 'super-easy-stock-manager');
                $result['error'] = __('You can\'t change the values of that product, because it has variations. Please change the value of the variation itself.', 'super-easy-stock-manager');
                return json_encode($result);
            }
            $update = "";
            switch ($action) {
                case 'price':
                    $update = $this->updatePrice($product);
                    break;
                case 'stock':
                    $update = $this->updateStock($product);
                    break;
            }
            if (is_string($update)) {
                return $update;
            }
            //Reload the product after update
            $product = $this->loadProduct($sku);
            $product_infos = $this->get_product_infos($product);

            $result = array_merge($result, $product_infos, $update);
            return json_encode($result);
        }
        //If Product is not a object it will be a Array with the error message.
        return json_encode($product);
    }
    /**
     * Updates the stock of a product / variation
     * On success, it returns;
     * template => "update"
     * manage_stock => true
     * change_txt => "The stock has been increased / decreased..."
     * direction => "increase" or "decrease"
     * save_status => $sku
     * from_quant => The quantity before the change
     * to_quant => The quantity after the change
     *
     * @param object $product - WC Product Object
     * 
     * @return array array with the values for template, change Text, etc.
     */
    public function updateStock($product)
    {
        $quantity = isset($_REQUEST['quantity']) ? wp_kses($_REQUEST['quantity'], []) : '';

        if (empty($quantity)) {
            return $this->errorJson();
        }
        if (!$this->validate_input($quantity, 'float')) {
            return $this->errorJson(__('Input must be a number', 'super-easy-stock-manager'));
        }
        //Convert to float
        settype($quantity, 'float');

        $result['manage_stock'] = $product->get_manage_stock();
        $result['template'] = 'updateStock';
        $old_quant = $product->get_stock_quantity();
        $manage_stock = $product->get_manage_stock();
        if ($manage_stock !== true) {
            $product->set_manage_stock(true);
            $old_quant = 0;
        }
        $increase = ($quantity > 0) ? true : false;
        $quant_positive = abs($quantity);
        $new_quant = ($increase) ? $old_quant + $quant_positive : $old_quant - $quant_positive;
        $result['from_quant'] = $old_quant;
        $result['to_quant'] = $new_quant;
        if ($increase) {
            $result['change_txt'] = sprintf(__('The stock has been increased by %d to %d', 'super-easy-stock-manager'), $quant_positive, $new_quant);
            $result['direction'] = 'increase';
        } else {
            $result['change_txt'] = sprintf(__('The stock has been decreased by %d to %d', 'super-easy-stock-manager'), $quant_positive, $new_quant);
            $result['direction'] = 'decrease';
        }
        $product->set_stock_quantity($new_quant);
        //Saves the changes to the product / variation
        $result['save_status'] = $product->save();
        return $result;
    }

    /**
     * Updates the Price of a product / variation
     * On success, it returns;
     * template => "updatePrice"
     * post_type => $this->getProductType()
     * old_regular => float
     * old_sale => float
     * new_regular => float
     * new_sale => float
     * currency => get_woocommerce_currency();
     * css_regular => "hide" or empty
     * css_sale => "hide" or empty
     * save_status => $sku
     * 
     * @param object $product - WC Product Object
     * 
     * @return array array with the values for template, new price, old price etc.
     */
    public function updatePrice($product)
    {
        $result = array();
        $regular_price = isset($_REQUEST['price']) ? wp_kses($_REQUEST['price'], []) : '';
        $sale_price = isset($_REQUEST['price_sale']) ? wp_kses($_REQUEST['price_sale'], []) : '';
        $type = $product->get_type();

        if (!$this->validate_input($regular_price, 'float') or !$this->validate_input($sale_price, 'float')) {
            return $this->errorJson(__('Input must be a number', 'super-easy-stock-manager'));
        }
        //Convert to float
        if (!empty($regular_price)) {
            settype($regular_price, 'float');
        }
        if (!empty($sale_price)) {
            settype($sale_price, 'float');
        }
        if (($regular_price > 0 and $sale_price > 0) and ($sale_price > $regular_price)) {
            $result['template'] = 'error';
            $result['title'] = __('Warning', 'super-easy-stock-manager');
            $result['error'] = __('Sale price has to be smaller than the regular price!', 'super-easy-stock-manager');
            return json_encode($result);
        }
        if (empty($regular_price) and empty($sale_price)) {
            return $this->errorJson();
        }
        $result['template'] = 'updatePrice';
        $result['from_regular'] = floatval($product->get_regular_price()) ?: 0;
        $result['from_sale'] = floatval($product->get_sale_price()) ?: 0;
        $result['to_regular'] = floatval($regular_price) ?: 0;
        $result['to_sale'] = floatval($sale_price) ?: 0;

        //If non of the prices has been changed, output error
        if ($result['from_regular'] === $result['to_regular'] or $result['from_sale'] === $result['to_sale']) {
            $noChange = __('Old and new prices are the same, nothing has been changed', 'super-easy-stock-manager');
            $result['notice'] = $noChange;
            return $result;
        }
        //Saves the changes to the product / variation
        if ($result['to_regular']) {
            update_post_meta($product->get_id(), '_regular_price', $result['to_regular']);
        }
        if ($result['to_sale']) {
            update_post_meta($product->get_id(), '_sale_price', $result['to_sale']);
        }
        //$result['save_status'] = $product->save();
        return $result;
    }

    /**
     * Loads the Product with all its attributes and properties.
     * If no product was found, it will return a error array.
     * 
     * @param string $sku - The Products SKU
     * 
     * @return mixed array on error, WP_Product Object on success
     */
    public function loadProduct($sku)
    {
        $result = array();
        $result['title'] = __('Info', 'super-easy-stock-manager');

        if (empty($sku)) {
            $result['template'] = 'error';
            $result['sku'] = $sku;
            $result['error'] = sprintf(__('No SKU provided', 'super-easy-stock-manager'), $sku);
            return $result;
        }
        $product_id = wc_get_product_id_by_sku($sku);
        if ($product_id === 0) {
            $result['template'] = 'error';
            $result['sku'] = $sku;
            if ($this->checkSKU($sku)) {
                $result['error'] = __('Could not load the Product. Please update the lookup tables. <br/>(Woocommerce -> Status -> Tools -> Rebuild Lookup Tables)', 'super-easy-stock-manager');
            } else {
                $result['error'] = sprintf(__('Product not found for SKU: %s', 'super-easy-stock-manager'), $sku);
            }
            return $result;
        } else {
            return wc_get_product($product_id);
        }
    }
    /**
     * Checks if SKU is found in PostMeta. If true, the user has to update the lookup-tables.
     *
     * @param int $sku - The SKU
     * 
     * @return mixed false if not found, post_id on success.
     */
    public function checkSKU($sku)
    {
        global $wpdb;
        $sku = wp_kses($sku, []);
        $prep = $wpdb->prepare("SELECT post_id FROM $wpdb->postmeta where meta_key ='_sku' and meta_value like '%d'", $sku);
        $getCol = $wpdb->get_col($prep);
        if (isset($getCol[0]) and !empty($getCol[0])) {
            return $getCol[0];
        }
        return false;
    }

    /**
     * Returns the product type as a translated string.
     *
     * @param string $type - Product Type
     * 
     * @return string Human readable product type
     */
    public function getProductType($type)
    {
        switch ($type) {
            case 'simple':
                return __('Simple Product', 'super-easy-stock-manager');
                break;

            case 'variable':
                return __('Product with Variations', 'super-easy-stock-manager');
                break;

            case 'variation':
                return __('Variation of Product', 'super-easy-stock-manager');
                break;

            default:
                return $type;
                break;
        }
    }

    /**
     * Retuns a json string with error message "No value set!" or a custom message if $msg is set
     * 
     * @param string $msg - Error message
     * @return string json fromated string
     */
    public function errorJson($msg = '')
    {
        $errorArr = array();
        $errorArr['title'] = __('Error', 'super-easy-stock-manager');
        $errorArr['template'] = 'error';
        $errorArr['error'] = (empty($msg)) ? __('No value set!', 'super-easy-stock-manager') : $msg;
        return json_encode($errorArr);
    }

    /**
     * Validates the input by type.
     *
     * @param string|int|float $input - The input string / number
     * @param string $type - The type to validate.
     * @return bool True if valid, false if not
     */
    public function validate_input($input, $type = 'string')
    {
        switch ($type) {
            case 'float':
                $new_input = floatval($input);
                return ($input == $new_input) ? true : false;
                break;
            case 'int':
                $new_input = intval($input);
                return ($input == $new_input) ? true : false;
                break;

            default:
                //No type given, no validation done
                return true;
                break;
        }
    }
}
