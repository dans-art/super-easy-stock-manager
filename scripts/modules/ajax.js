/**
 * Module to handle the ajax actions
 * 
 */
 class SesmAjax {

    do_ajax() {
        var input = jQuery("#sesm_sku_input").val(),
            quant = jQuery("#sesm_quant").val(),
            price = jQuery(".sesm_input.update_price").val(),
            price_sale = jQuery(".sesm_input.update_price.sale").val();
        jQuery("#sesm_sku_input_loader").addClass("active");

        var n = { action: "sesm-ajax", do: sesm_scripts.sesm_do, sku: input, quantity: quant, price: price, price_sale: price_sale };
        jQuery.post(wp_site_url + "/wp-admin/admin-ajax.php", n, function (s) {
            sesm_scripts.addToHistory(jQuery.parseJSON(s)), jQuery("#sesm_sku_input_loader").removeClass("active");
        });
    }
}
export { SesmAjax };