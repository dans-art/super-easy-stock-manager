/**
 * Module to handle the ajax actions
 * 
 */
class SesmAjax {

    /**
     * Executes an ajax request
     */
    async do_ajax() {
        const input = jQuery("#sesm_sku_input").val(),
            quant = jQuery("#sesm_quant").val(),
            price = jQuery(".sesm_input.update_price").val(),
            price_sale = jQuery(".sesm_input.update_price.sale").val();

        jQuery("#sesm_sku_input_loader").addClass("active");
        jQuery("#sesm_sku_input").val(""); //Clear input to allow for fast scanning

        var n = { action: "sesm-ajax", do: sesm_scripts.sesm_do, sku: input, quantity: quant, price: price, price_sale: price_sale };
        return await jQuery.post(wp_site_url + "/wp-admin/admin-ajax.php", n, function (result) {
            jQuery("#sesm_sku_input_loader").removeClass("active");
            return result;
        });
    }
}
export { SesmAjax };