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
            $product_parent_id = ($product->get_parent_id()) ?: $product->get_id();
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
            $result['weight'] = wc_format_weight( $product->get_weight());
            $result['attributes'] = wc_get_formatted_variation($product, true);
            $result['product_url'] = get_edit_post_link($product_parent_id);
            $result['product_variations'] = $this->load_product_variations($product);
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
                    $update = $this->updatePrices($product);
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

        $manage_stock = $product->get_manage_stock();
        if ($manage_stock !== true) {
            $product->set_manage_stock(true);
            $old_quant = 0;
        }
        $quant_positive = abs($quantity);

        $result['change_txt'] = sprintf(__('The stock has set to %d', 'super-easy-stock-manager'), $quant_positive);

        $product->set_stock_quantity($quant_positive);
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
    public function updatePrices($product)
    {
        $result = array();
        $regular_price = isset($_REQUEST['price']) ? wp_kses($_REQUEST['price'], []) : '';
        $sale_price = isset($_REQUEST['price_sale']) ? wp_kses($_REQUEST['price_sale'], []) : '';
        $result['template'] = 'updatePrice';
        $result['from_regular'] = floatval($product->get_regular_price());
        $result['from_sale'] = floatval($product->get_sale_price());
        $result['to_regular'] = floatval($regular_price);
        $result['to_sale'] = floatval($sale_price);
        $result['regular_notice'] = '';
        $result['sale_notice'] = '';

        //Check if the sale price is smaller than the regular price
        if (!$this->salePriceIsSmallerThanRegular()) {
            $result['template'] = 'error';
            $result['title'] = __('Warning', 'super-easy-stock-manager');
            $result['error'] = __('Sale price has to be smaller than the regular price!', 'super-easy-stock-manager');
            return json_encode($result);
        }

        //try to update the prices
        $updateRegular = $this->checkAndUpdatePrice($product, 'regular');
        $updateSale = $this->checkAndUpdatePrice($product, 'sale');

        $result['to_regular'] = $updateRegular;
        $result['to_sale'] = $updateSale;

        if ($regular_price === '0' and $updateRegular >= 0) {
            $result['regular_notice'] = __('Regular price set to 0', 'super-easy-stock-manager');
        }
        if ($sale_price == '0' and $updateSale >= 0) {
            $result['sale_notice'] = __('Sale price set to 0', 'super-easy-stock-manager');
        }

        //If none of the prices has been changed, output error
        if ($updateRegular === null and $updateSale === null) {
            $noChange = __('Old and new prices are the same, nothing has been changed', 'super-easy-stock-manager');
            $result['regular_notice'] = $noChange;
            $result['sale_notice'] = '';
            return $result;
        }


        $result['save_status'] = $product->save();
        return $result;
    }

    /**
     * Checks if the price is valid and updated the product if so
     *
     * @param object $product
     * @param string $type
     * @return bool|string String on error, true on success, null if nothing updated
     */
    public function checkAndUpdatePrice($product, $type)
    {
        $field_name = ($type === 'regular') ? 'price' : 'price_sale';
        $price = isset($_REQUEST[$field_name]) ? wp_kses($_REQUEST[$field_name], []) : ''; //The regular or the sale price
        $old_price = ($type === 'regular') ? $product->get_regular_price() : $product->get_sale_price();
        if ($price == '') {
            return null;
        }

        //Check if old and new price are the same
        if ($price === $old_price) {
            return null;
        }
        if (!$this->validate_input($price, 'float')) {
            return $this->errorJson(__('Input must be a number', 'super-easy-stock-manager'));
        }
        //Convert to float
        settype($price, 'float');

        //Saves the changes to the product / variation
        if ($type === 'regular') {
            update_post_meta($product->get_id(), '_regular_price', $price);
        } else {
            update_post_meta($product->get_id(), '_sale_price', $price);
        }
        return $price;
    }
    /**
     * Check if the sale price is smaller than the regular price
     *
     * @return bool 
     */
    public function salePriceIsSmallerThanRegular()
    {
        $regular_price = isset($_REQUEST['price']) ? wp_kses($_REQUEST['price'], []) : '';
        $sale_price = isset($_REQUEST['price_sale']) ? wp_kses($_REQUEST['price_sale'], []) : '';

        settype($regular_price, 'float');
        settype($sale_price, 'float');

        //Check if the sale price is smaller than the regular price
        if (($regular_price > 0 and $sale_price > 0) and ($sale_price > $regular_price)) {
            return false;
        }
        return true;
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
     * Loads the siblings of a product variation.
     *
     * @param WC_Product $product
     * @return array The Product variations with quantity and attributes
     */
    public function load_product_variations($product)
    {
        $children_arr = [];
        if($product -> get_type() === 'variation'){
            $parent_id = $product -> get_parent_id();
            $parent = wc_get_product($parent_id);
            $children = $parent -> get_children();
            foreach($children as $child_id){
                $child = wc_get_product( $child_id );
                $attributes = wc_get_formatted_variation($child, true);

                
                $children_arr[$child -> get_id()] = array(
                    "stock" => $child -> get_stock_quantity() . '&nbsp;' . __('pcs','super-easy-stock-manager'),
                    "attributes" => $attributes
                );
            }
        }
        return $children_arr;
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
                return ($input == $new_input or $new_input == 0) ? true : false;
                break;
            case 'int':
                $new_input = intval($input);
                return ($input == $new_input or $new_input == 0) ? true : false;
                break;

            default:
                //No type given, no validation done
                return true;
                break;
        }
    }
}
