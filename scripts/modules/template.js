/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/**
 * Module to handle the ajax actions
 *
 */
class SesmTemplate {
  // All the loaded templates
  loaded_templates = {};

  /**
   * Loads the template files to the loaded template property
   */
  async load_default_templates() {
    this.load_template('item', 'item.html', 'templates/frontend/');
    this.load_template('error', 'error.html', 'templates/frontend/');
    this.load_template('errortooltip', 'error-tooltip.html', 'templates/frontend/');
    this.load_template('updatestock', 'item-update-stock.html', 'templates/frontend/');
    this.load_template('updateprice', 'item-update-price.html', 'templates/frontend/');
  }

  /**
   * Loads a template to the class. Is also called by the get_template method.
   * @param {string} templateId - The ID of the template. Must be unique, otherwise one template can override the other
   * @param {string} fileName - The File name of the template with extension
   * @param {string} path - The path the template is saved in
   * @return {bool|string} False on error, html code on success
   */
  async load_template(templateId, fileName, path) {
    try {
      const loadedContent = await this.get_template(templateId, fileName, path).then(function(content) {
        return content;
      });
      this.loaded_templates[templateId] = loadedContent;
    } catch (error) {
      console.error('failed to load template: ' + window.sesm_plugin_root + path + fileName);
      console.error(error);
    }
    return false;
  }

  /**
     * Loads a template file. If the template is already loaded, it will use the one from the get this.loaded_templates object, if loaded
     * @param {string} templateId - The ID of the template. Must be unique, otherwise one template can override the other
     * @param {string} file - The File name of the template with extension
     * @param {string} subfolder - The path the template is saved in
     * @return {string} The template as html
     */
  async get_template(templateId, file, subfolder = '') {
    if (!sesmScripts.empty(this.loaded_templates[templateId])) {
      return this.loaded_templates[templateId];
    }
    const response = await jQuery.get(
        window.sesm_plugin_root + subfolder + file,
        function(data, textStatus, jqxhr) {
          return data;
        },
    );
    this.loaded_templates[templateId] = response;
    return response;
  }

  /**
     * Adds the data to the template
     *
     * @param {string} template The template as html string with {{placeholder}}
     * @param {object} data The data to fill in
     * @return {string} String on success, false on error
     */
  apply_template(template, data) {
    if (typeof data !== 'object') {
      return false;
    }
    jQuery.each(data, function(key, value) {
      template = template.replaceAll('{{' + key + '}}', value);
    });

    return template;
  }
}
export {SesmTemplate};
