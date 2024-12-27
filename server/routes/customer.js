const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { customers } = require('../data/mockData');

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('只支持 Excel 文件格式'));
    }
  }
});

// 生成7位数字ID
function generateCustomerId() {
  // 获取当前最大ID
  const maxId = customers.reduce((max, customer) => {
    const id = parseInt(customer.id);
    return id > max ? id : max;
  }, 1000000); // 从1000000开始

  return maxId + 1;
}

// 导入客户信息
router.post('/import', upload.single('file'), (req, res) => {
  try {
    console.log('收到导入请求:', req.file);
    
    if (!req.file) {
      console.log('未接收到文件');
      return res.status(400).json({ error: '请选择要导入的文件' });
    }

    console.log('文件信息:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    console.log('工作簿信息:', {
      SheetNames: workbook.SheetNames,
      SheetCount: workbook.SheetNames.length
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
    console.log('解析的数据:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('数据为空或格式不正确');
      return res.status(400).json({ error: '文件内容为空或格式不正确' });
    }

    // 验证数据格式
    const invalidData = data.filter(row => {
      // 检查必填字段是否存在且不为空
      if (!row['名称'] || typeof row['名称'] !== 'string' || !row['地址'] || typeof row['地址'] !== 'string') {
        return true;
      }
      return false;
    });

    if (invalidData.length > 0) {
      console.log('发现无效数据:', invalidData);
      return res.status(400).json({ 
        error: '数据格式不正确',
        details: '名称和地址为必填字段，请检查以下数据：',
        invalidRows: invalidData 
      });
    }

    // 转换数据格式并添加到客户列表
    const newCustomers = [];
    for (const row of data) {
      let id = row['客户ID'] ? parseInt(row['客户ID']) : null;
      
      // 如果提供了ID，验证其格式和唯一性
      if (id) {
        console.log('检查客户ID:', id);
        if (id < 1000000 || String(id).length !== 7) {
          return res.status(400).json({ 
            error: '客户ID格式不正确',
            details: `ID ${id} 必须是7位数字且大于等于1000000`
          });
        }
        
        if (customers.some(c => c.id === id)) {
          return res.status(400).json({ 
            error: '客户ID已存在',
            details: `ID ${id} 已被使用`
          });
        }
      } else {
        // 如果没有提供ID，自动生成
        id = generateCustomerId();
        console.log('生成新ID:', id);
      }

      // 确保字符串字段的处理
      const name = String(row['名称'] || '').trim();
      const nickname = row['昵称'] ? String(row['昵称']).trim() : null;
      const address = String(row['地址'] || '').trim();
      const remarks = row['备注'] ? String(row['备注']).trim() : '';

      if (!name || !address) {
        return res.status(400).json({
          error: '数据格式不正确',
          details: '名称和地址不能为空',
          invalidRow: row
        });
      }

      newCustomers.push({
        id,
        name,
        nickname,
        address,
        remarks
      });
    }
    
    console.log('准备导入的新客户:', newCustomers);
    customers.push(...newCustomers);
    
    console.log('导入成功');
    res.json({ 
      success: true, 
      message: `成功导入 ${newCustomers.length} 条客户数据`
    });
  } catch (error) {
    console.error('导入客户数据失败:', error);
    res.status(500).json({ 
      error: '导入失败',
      details: error.message,
      stack: error.stack
    });
  }
});

// 导出客户信息
router.get('/export', (req, res) => {
  try {
    // 转换数据格式
    const data = customers.map(customer => ({
      '客户ID': String(customer.id).padStart(7, '0'), // 格式化为7位数字
      '名称': customer.name,
      '昵称': customer.nickname || '',
      '地址': customer.address,
      '备注': customer.remarks || ''
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 客户ID
      { wch: 20 }, // 名称
      { wch: 15 }, // 昵称
      { wch: 30 }, // 地址
      { wch: 30 }  // 备注
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, '客户列表');

    // 生成文件并发送
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('导出客户数据失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取客户列表
router.get('/', (req, res) => {
  console.log('Sending customers:', customers);
  res.json(customers);
});

// 创建客户
router.post('/', (req, res) => {
  try {
    let { id, ...customerData } = req.body;
    
    // 如果提供了ID，验证其唯一性
    if (id) {
      id = parseInt(id);
      const exists = customers.some(c => c.id === id);
      if (exists) {
        return res.status(400).json({ error: '客户ID已存在' });
      }
    } else {
      // 如果没有提供ID，自动生成
      id = generateCustomerId();
    }

    const newCustomer = {
      id,
      ...customerData
    };

    customers.push(newCustomer);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('创建客户失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新客户
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '客户不存在' });
  }
  customers[index] = { ...customers[index], ...req.body };
  res.json(customers[index]);
});

// 删除客户
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '客户不存在' });
  }
  customers.splice(index, 1);
  res.status(204).send();
});

module.exports = router; 