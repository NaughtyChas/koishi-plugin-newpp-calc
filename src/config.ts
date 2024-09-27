import { Schema } from "koishi";

export interface Config {
  pathBrowser: string;
}

export const Config: Schema<Config> = Schema.intersect([
  // 通用设置
  Schema.object({
    pathBrowser: Schema.string()
      .default("/usr/bin/chromium")
      .description("puppeteer浏览器可执行文件路径"),
  }),
]);


export const name = "newpp";

export default Config;
