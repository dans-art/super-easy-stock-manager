/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/**
 * Module to handle the ajax actions
 *
 */
class SesmAjax {
  /**
     * Executes an ajax request
     */
  async do_ajax() {
    const input = jQuery('#sesm_sku_input').val();
    const quant = jQuery('#sesm_quant').val();
    const price = jQuery('.sesm_input.update_price').val();
    const priceSale = jQuery('.sesm_input.update_price.sale').val();

    jQuery('#sesm_sku_input_loader').addClass('active');
    jQuery('#sesm_sku_input').val(''); // Clear input to allow for fast scanning

    const n = {action: 'sesm-ajax', do: sesmScripts.sesm_do, sku: input, quantity: quant, price: price, price_sale: priceSale};
    return await jQuery.post(wpSiteUrl + '/wp-admin/admin-ajax.php', n, function(result) {
      jQuery('#sesm_sku_input_loader').removeClass('active');
      return result;
    });
  }
}
export {SesmAjax};
