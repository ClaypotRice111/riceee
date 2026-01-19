let isLogin = true;

// 切换登录/注册模式
function toggleMode() {
    isLogin = !isLogin;
    document.getElementById('title').innerText = isLogin ? '登录' : '注册新账号';
    document.getElementById('btn').innerText = isLogin ? '登录' : '立即注册';
    document.getElementById('toggleText').innerText = isLogin ? '没有账号？去注册' : '已有账号？去登录';
    document.getElementById('msg').innerText = ''; // 清空错误信息
}

// 处理提交
async function handleSubmit() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('msg');

    if(!username || !password) {
        msgBox.innerText = '请输入完整的用户名和密码';
        return;
    }

    msgBox.innerText = '处理中...';
    msgBox.style.color = '#666';

    // 根据模式决定请求哪个接口
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            if (isLogin) {
                // 登录成功 -> 跳转
                window.location.href = '/home';
            } else {
                // 注册成功 -> 切回登录
                alert('🎉 注册成功！请使用新账号登录。');
                toggleMode();
                document.getElementById('username').value = username; // 贴心地帮用户填好用户名
                document.getElementById('password').value = '';
                msgBox.innerText = '';
            }
        } else {
            // 后端返回错误（如：密码错、用户已存在）
            const errorText = await res.text();
            msgBox.style.color = 'red';
            msgBox.innerText = errorText || '操作失败';
        }
    } catch (error) {
        msgBox.style.color = 'red';
        msgBox.innerText = '网络连接错误，请稍后重试';
    }
}