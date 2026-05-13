// 抖音云最小可用 Node 服务：仅为通过云端构建/部署。
// 万年历小程序自身是纯前端，没有真实接口需求，这里只暴露健康检查。
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router
  .get('/', (ctx) => {
    ctx.body = 'wannianli cloud ok';
  })
  .get('/health', (ctx) => {
    ctx.body = { ok: true, ts: Date.now() };
  });

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Number(process.env.PORT) || 8000;
app.listen(PORT, () => {
  console.log(`wannianli server running on ${PORT}`);
});
