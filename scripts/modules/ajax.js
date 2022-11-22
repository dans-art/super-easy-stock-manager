/**
 * Module to handle the ajax actions
 * 
 */
class SesmAjax {

    /**
     * Executes an ajax request
     */
    async do_ajax() {
        var input = jQuery("#sesm_sku_input").val(),
            quant = parseInt(jQuery("#sesm_quant").val()),
            price = parseFloat(jQuery(".sesm_input.update_price").val()),
            price_sale = parseFloat(jQuery(".sesm_input.update_price.sale").val());

        var number_values = { quant: quant, price: price, price_sale: price_sale }
        for (const [key, value] of Object.entries(number_values)) {
            if (Number.isNaN(value)) {
                number_values[key] = 0;
            }
        }
        jQuery("#sesm_sku_input_loader").addClass("active");
        jQuery("#sesm_sku_input").val(""); //Clear input to allow for fast scanning

        var n = { action: "sesm-ajax", do: sesm_scripts.sesm_do, sku: input, quantity: number_values.quant, price: number_values.price, price_sale: number_values.price_sale };
        return await jQuery.post(wp_site_url + "/wp-admin/admin-ajax.php", n, function (result) {
            jQuery("#sesm_sku_input_loader").removeClass("active");
            return result;
        });
    }
}
export { SesmAjax };