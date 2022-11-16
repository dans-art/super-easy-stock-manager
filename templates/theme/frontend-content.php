<section id="sesm_buttons">
    <span data-do="get_product">
        <span class="sesm_icon"><i class="fas fa-question"></i></span>
        <span class="sesm_icon_line"></span>
    </span>
    <span data-do="add_quantities">
        <span class="sesm_icon"><i class="fas fa-box-open"></i></span>
        <span class="sesm_icon_line"></span>
    </span>
    <span data-do="update_price">
        <span class="sesm_icon"><i class="far fa-money-bill-alt"></i></span>
        <span class="sesm_icon_line"></span>
    </span>
</section>
<section id="sesm_input">
<div>
        <input id="sesm_sku_input" style="display: none;" type="text" />
        <div id="sesm_sku_input_loader" class="input_loading"></div>
        <label for="sesm_sku_input" style="display: none;"><?php echo __("SKU", "sesm");?></label>
    </div>
    <div class="sesm_options">
        <div class="quant_flex_group sesm_input add_quantities" style="display: none;">
            <button id="remove_quant_btn" class="options_button">
                <i class="fas fa-minus"></i>
            </button>
            <input id="sesm_quant" type="text" class="sesm_input add_quantities" value="1"/>
            <button id="add_quant_btn" class="options_button">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    <label for="sesm_quant" class="sesm_label add_quantities"  style="display: none;"><?php echo __("Add quantity", "sesm");?></label>

    <div class="price_flex_group">
    <div>
        <input id="sesm_price_reg" class="sesm_input update_price" style="display: none;" type="text" />
        <label for="sesm_price_reg" class="sesm_label update_price"  style="display: none;"><?php echo __("Price regular", "sesm");?></label>
    </div>
    <div>
        <input id="sesm_price_sale" class="sesm_input update_price sale" style="display: none;" type="text"/>
        <label for="sesm_price_sale" class="sesm_label update_price"  style="display: none;"><?php echo __("Price sale", "sesm");?></label>    
    </div>
    </div>


    </div>

</section>
<section id="sesm_history">

</section>