<?php

/**
 * The main template for the frontend of the super-easy-stock-manager
 * Author: Dan's Art
 * Version: 1.3.1
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
?>
<div id="sesm_container">
    <section id="sesm_buttons" style="display: none;">
        <button data-do="get_product">
            <span class="sesm_icon"><i class="fas fa-question"></i></span>
            <span class="sesm_icon_line"></span>
        </button>
        <button data-do="add_quantities">
            <span class="sesm_icon"><i class="fas fa-box-open"></i></span>
        </button>
        <button data-do="update_price">
            <span class="sesm_icon"><i class="far fa-money-bill-alt"></i></span>
        </button>
    </section>
    <div id="selection-indicator"></div>
    <section id="sesm_input">
        <div>
            <input id="sesm_sku_input" style="display: none;" type="text" placeholder="<?php echo __("Scan a barcode or add a SKU number and press enter", "super-easy-stock-manager"); ?>" />
            <div id="sesm_sku_input_loader" class="input_loading"></div>
        </div>
        <div class="sesm_options">
            <div class="quant_flex_group sesm_input add_quantities" style="display: none;">
                <button id="remove_quant_btn" class="options_button">
                    <i class="fas fa-minus"></i>
                </button>
                <input id="sesm_quant" type="text" class="sesm_input add_quantities" value="1" placeholder="<?php echo __("Enter quantity to add or remove", "super-easy-stock-manager"); ?>" />
                <button id="add_quant_btn" class="options_button">
                    <i class="fas fa-plus"></i>
                </button>
            </div>

            <div class="price_flex_group" style="display: none;">
                <div>
                    <input id="sesm_price_reg" class="sesm_input update_price" type="text" placeholder="<?php echo __("Price regular", "super-easy-stock-manager"); ?>" />
                </div>
                <div>
                    <input id="sesm_price_sale" class="sesm_input update_price sale" type="text" placeholder="<?php echo __("Price sale", "super-easy-stock-manager"); ?>" />
                </div>
            </div>
        </div>
    </section>
    <section id="sesm_history">
    </section>
    <div id="mobile-scan-container">
        <button id="scan-button" class="scan-button-style">
            <i class="fa-solid fa-camera"></i>
            <i class="fa-solid fa-barcode"></i>
        </button>
        <button id="scan-button-active" class="scan-button-style">
            <i class="fa-solid fa-times"></i>
        </button>
        <div id="scanner-container" width="100%" height="5em"></div>
    </div>
</div>