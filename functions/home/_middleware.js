// functions/_middleware.js

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const cookie = request.headers.get("Cookie");

    // 判断逻辑：
    // 1. 如果用户访问的是根路径 "/" (也就是登录页)
    // 2. 并且用户身上带着 "auth_token=valid_user" 的 Cookie
    if (url.pathname === "/" && cookie && cookie.includes("auth_token=valid_user")) {
        // 直接重定向到 /home，跳过登录页
        return Response.redirect(new URL("/home", request.url), 302);
    }

    // 其他情况（访问其他页面，或者没有登录），直接放行
    return next();
}