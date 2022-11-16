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
            $type = $product->get_type();
            $result['post_type'] = $this->getProductType($type);
            $result['title'] = $product->get_name();
            $result['stock_quantity'] = $product->get_stock_quantity() ?: "-";
            $result['price'] = $product->get_price() ?: "-";
            $result['currency'] = get_woocommerce_currency();
            $result['regular_price'] = $product->get_regular_price() ?: "-";
            $result['sale_price'] = $product->get_sale_price() ?: "-";
            $result['description'] = substr($product->get_short_description(), 0, 50);
            $result['image'] = $product->get_image('thumbnail');
            return json_encode($result);
        }
        return json_encode($product);
    }
    /**
     * Updates a Product
     *
     * @param string $action - Action to do. Valid options: price, stock
     * @param string $sku    - SKU of a product
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
                $result['error'] = __('You can\'t change the values of that product, because it has variations. Please change the value of the variation itself.', 'sesm');
                return json_encode($result);
            }

            $result['title'] = $product->get_title();
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
            $result = array_merge($result, $update);
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
     *
     * @param object $product - WC Product Object
     * 
     * @return array array with the values for template, change Text, etc.
     */
    public function updateStock($product)
    {
        $quantity = isset($_REQUEST['quantity']) ? $_REQUEST['quantity'] : '';
        if (empty($quantity)) {
            return $this->errorJson();
        }
        settype($quantity, 'float');

        $result['manage_stock'] = $product->get_manage_stock();
        $result['template'] = 'update';
        $old_quant = $product->get_stock_quantity();
        $manage_stock = $product->get_manage_stock();
        if ($manage_stock !== true) {
            $product->set_manage_stock(true);
            $old_quant = 0;
        }
        $increase = ($quantity > 0) ? true : false;
        $quant_positive = abs($quantity);
        $new_quant = ($increase) ? $old_quant + $quant_positive : $old_quant - $quant_positive;
        if ($increase) {
            $result['change_txt'] = sprintf(__('The stock has been increased by %d to %d', 'sesm'), $quant_positive, $new_quant);
            $result['direction'] = 'increase';
        } else {
            $result['change_txt'] = sprintf(__('The stock has been decreased by %d to %d', 'sesm'), $quant_positive, $new_quant);
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
        $regular_price = isset($_REQUEST['price']) ? $_REQUEST['price'] : '';
        $sale_price = isset($_REQUEST['price_sale']) ? $_REQUEST['price_sale'] : '';
        $type = $product->get_type();
        if (!empty($regular_price)) {
            settype($regular_price, 'float');
        }
        if (!empty($sale_price)) {
            settype($sale_price, 'float');
        }
        if (($regular_price > 0 and $sale_price > 0) and ($sale_price > $regular_price)) {
            $result['template'] = 'error';
            $result['error'] = __('Sale price has to be smaller than the regular price!', 'sesm');
            return json_encode($result);
        }
        if (empty($regular_price) and empty($sale_price)) {
            return $this->errorJson();
        }
        $result['template'] = 'updatePrice';
        $result['post_type'] = $this->getProductType($type);
        $result['old_regular'] = $product->get_regular_price() ?: "-";
        $result['old_sale'] = $product->get_sale_price() ?: "-";
        $result['new_regular'] = $regular_price;
        $result['new_sale'] = $sale_price;
        $result['currency'] = get_woocommerce_currency();
        if (!empty($regular_price) AND $regular_price !== (float) $result['old_regular']) {
            $product->set_regular_price($regular_price);
            $result['css_regular'] = '';
        } else {
            $result['css_regular'] = 'hide';
        }
        if (!empty($sale_price) AND $sale_price !== (float) $result['old_sale']) {
            $product->set_sale_price($sale_price);
            $result['css_sale'] = '';
        } else {
            $result['css_sale'] = 'hide';
        }
        //If non of the prices has been changed, output error
        if (!empty($result['css_regular']) AND !empty($result['css_sale'])) {
            $noChange = __('Old and new prices are the same, nothing has been changed', 'sesm');
            return $this->errorJson($noChange);
        }
        //Saves the changes to the product / variation
        $result['save_status'] = $product->save();
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
        $sku = (integer) $sku;
        if (empty($sku)) {
            $result['template'] = 'error';
            $result['sku'] = $sku;
            $result['error'] = sprintf(__('No SKU provided', 'sesm'), $sku);
            return $result;
        }
        $product_id = wc_get_product_id_by_sku($sku);
        if ($product_id === 0) {
            $result['template'] = 'error';
            $result['sku'] = $sku;
            if($this->checkSKU($sku)){
                $result['error'] = __('Could not load the Product. Please update the lookup tables. <br/>(Woocommerce -> Status -> Tools -> Rebuild Lookup Tables)', 'sesm');
            }else{
                $result['error'] = sprintf(__('Product not found for SKU: %s', 'sesm'), $sku);
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
    public function checkSKU($sku){
        global $wpdb;
        $sku = (integer) $sku;
        $prep = $wpdb->prepare( "SELECT post_id FROM $wpdb->postmeta where meta_key ='_sku' and meta_value like '%d'", $sku );
        $getCol = $wpdb->get_col( $prep );
        if(isset($getCol[0]) AND !empty($getCol[0])){
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
            return __('Simple Product', 'sesm');
            break;

        case 'variable':
            return __('Product with Variations', 'sesm');
            break;

        case 'variation':
            return __('Variation of Product', 'sesm');
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
     * 
     * @return string json fromated string
     */
    public function errorJson($msg = '')
    {
        $errorArr = array();
        $errorArr['template'] = 'error';
        $errorArr['error'] = (empty($msg)) ? __('No value set!', 'sesm') : $msg;
        return json_encode($errorArr);
    }
}
