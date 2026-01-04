// api/submit.js
// 导入 MongoDB 客户端
import { MongoClient } from 'mongodb';

// 云函数入口函数
export default async function handler(req, res) {
    // 1. 只允许 POST 请求（表单提交用 POST）
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: '只支持 POST 请求！' });
    }

    // 2. 接收前端提交的表单数据
    const { name, email, message } = req.body;
    // 简单验证数据是否完整
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: '姓名、邮箱、留言不能为空！' });
    }

    // 3. 连接 MongoDB 数据库并插入数据
    let client;
    try {
        // 从 Vercel 环境变量获取 MongoDB 连接字符串（避免硬编码泄露信息）
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect(); // 建立数据库连接
        console.log('MongoDB 连接成功！');

        // 选择数据库和集合
        const db = client.db('contact_db'); // 对应你在 MongoDB Atlas 创建的数据库名
        const collection = db.collection('messages'); // 对应你创建的集合名

        // 插入表单数据（添加创建时间字段，方便后续查询）
        await collection.insertOne({
            name,
            email,
            message,
            createdAt: new Date() // 自动生成当前时间
        });

        // 4. 返回提交成功响应
        return res.status(200).json({ success: true, message: '表单数据提交成功！' });
    } catch (error) {
        // 捕获错误并返回
        console.error('数据库操作失败：', error);
        return res.status(500).json({ success: false, message: '服务器内部错误，提交失败！' });
    } finally {
        // 5. 无论成功与否，最终关闭数据库连接
        if (client) {
            await client.close();
            console.log('MongoDB 连接已关闭！');
        }
    }
}
