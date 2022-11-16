<article id="${sku}" class="item default">
    <div class="icon"><i class="fas fa-question"></i></div>
    <div class="content">
        <div class="title">${title} <span>(${post_type})</span></div>
        <div class="history_flex">
            <div class="stock_quantity"><?php echo __('Quantity', 'sesm');?></div>
            <div class="stock_quantity">${stock_quantity}</div>
        </div>
        <div class="history_flex">
            <div class="regular_price"><?php echo __('Price regular', 'sesm');?></div>
            <div class="regular_price">${regular_price} ${currency}</div>
        </div>
        <div class="history_flex">
            <div class="sale_price"><?php echo __('Price sale', 'sesm');?></div>
            <div class="sale_price">${sale_price} ${currency}</div>
        </div>
        <div class="history_flex">
            <div class="description"><?php echo __('Description', 'sesm');?></div>
            <div class="description">${description}</div>
        </div>
        </div>
    </div>
    <div class="image">${image}</div>
</article>