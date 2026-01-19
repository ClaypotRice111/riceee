export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response("缺少用户名 or 密码", { status: 400 });
        }

        // 1. 密码加密 (SHA-256)
        const myText = new TextEncoder().encode(password);
        const myDigest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);
        const hashArray = Array.from(new Uint8Array(myDigest));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. 存入 D1 数据库
        // 注意：这里的 'DB' 必须和你 Cloudflare 后台绑定的变量名一致
        await env.DB.prepare(
            "INSERT INTO users (username, password) VALUES (?, ?)"
        ).bind(username, passwordHash).run();

        return new Response("Created", { status: 200 });

    } catch (e) {
        // 捕捉错误，通常是“用户名已存在 (UNIQUE constraint failed)”
        return new Response("注册失败：用户名可能已被占用", { status: 409 });
    }
}