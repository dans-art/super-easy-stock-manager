<article id="${sku}" class="item update">
    <div class="icon"><i class="fas fa-box-open"></i></div>
    <div class="content">
    <div class="content">
        <div class="title">${title} <span>(${post_type})</span></div>
        <div class="history_flex ${css_regular}">
            <div class="regular_price"><?php echo __('Price regular', 'sesm');?></div>
            <div class="regular_price">${old_regular} <i class="fas fa-arrow-right"></i> ${new_regular} ${currency}</div>
        </div>
        <div class="history_flex ${css_sale}">
            <div class="sale_price"><?php echo __('Price sale', 'sesm');?></div>
            <div class="sale_price">${old_sale} <i class="fas fa-arrow-right"></i> ${new_sale} ${currency}</div>
        </div>
        </div>
    </div>
    </div>
</article>