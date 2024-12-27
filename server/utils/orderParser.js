class OrderParser {
  constructor() {
    // 商品名称映射表
    this.productNameMap = new Map([
      ['面包', ['面包']],
      ['甜酒', ['甜酒']],
      ['小青柑', ['小青柑', '青柑']],
      ['巨峰', ['巨峰']],
      ['豆腐', ['豆腐']]
    ]);
  }

  parseOrderText(orderText) {
    try {
      if (!orderText) {
        throw new Error('订单文本不能为空');
      }

      console.log('\n========== 开始解析订单 ==========');
      
      const [priceList, orderList] = this.splitText(orderText);
      console.log('价格列表:', priceList);
      console.log('订单列表:', orderList);
      
      const priceMap = this.parsePriceList(priceList);
      console.log('价格映射:', Object.fromEntries(priceMap));

      const orders = orderList.map(line => {
        // 移除序号和点
        const orderText = line.replace(/^\d+\.\s*/, '');
        
        // 分离备注信息（用括号标注的内容）
        const remarkMatch = orderText.match(/\((.*?)\)/);
        const remarks = remarkMatch ? remarkMatch[1] : '';
        const cleanOrderText = orderText.replace(/\(.*?\)/, '').trim();
        
        const [customerName, ...items] = cleanOrderText.split(/\s+/);
        const orderItems = this.parseOrderItems(items.join(' '), priceMap);
        
        return {
          customerName,
          items: orderItems,
          remarks  // 添加备注字段
        };
      });

      console.log('解析结果:', JSON.stringify(orders, null, 2));
      return orders;
    } catch (error) {
      console.error('解析订单失败:', error);
      throw error;
    }
  }

  parsePriceList(priceList) {
    const priceMap = new Map();
    
    priceList.forEach(line => {
      const match = line.match(/^(.+?)\s*(\d+\.?\d*)元$/);
      if (match) {
        const [, name, price] = match;
        const normalizedName = this.normalizeProductName(name.trim());
        priceMap.set(normalizedName, parseFloat(price));
      }
    });
    
    return priceMap;
  }

  parseOrderItems(itemText, priceMap) {
    const items = [];
    const itemRegex = /([^+]+?)(半|\d+(?:盒)?)\+?/g;
    let match;

    while ((match = itemRegex.exec(itemText)) !== null) {
      const [, rawName, quantityText] = match;
      const normalizedName = this.normalizeProductName(rawName.trim());
      
      // 处理数量
      let quantity = quantityText === '半' ? 0.5 : parseFloat(quantityText.replace('盒', ''));
      
      // 获取单价
      const unitPrice = priceMap.get(normalizedName);
      
      items.push({
        productName: normalizedName,
        quantity,
        unitPrice,
        totalPrice: (unitPrice * quantity)
      });
    }

    return items;
  }

  normalizeProductName(name) {
    const trimmedName = name.trim();
    for (const [standard, variants] of this.productNameMap) {
      if (variants.some(variant => trimmedName.includes(variant))) {
        return standard;
      }
    }
    return trimmedName;
  }

  splitText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const priceEndIndex = lines.findIndex(line => line.includes('订单信息'));
    
    if (priceEndIndex === -1) {
      throw new Error('找不到订单信息分隔符');
    }
    
    const priceList = lines.slice(0, priceEndIndex).filter(line => line.includes('元'));
    const orderList = lines.slice(priceEndIndex + 1).filter(line => /^\d+\./.test(line));
    
    return [priceList, orderList];
  }
}

module.exports = new OrderParser(); 