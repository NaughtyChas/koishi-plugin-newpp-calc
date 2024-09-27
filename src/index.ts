import { Context } from 'koishi';
import puppeteer from 'puppeteer';
import type Config from './config';

export const name = 'newpp-calc';
export const using = ['puppeteer'];

export function apply(ctx: Context, config: Config, options: { token: string }) {
  ctx.command('newpp <mapID>', '用最新的pp算法计算单谱面pp！')
    .action(async ({ session }, mapID) => {
      if (!mapID) {
        return '不告诉谱面ID我怎么查！';
      }

      await session.send("正在查询...");

      try {
        const browser = await puppeteer.launch({
          executablePath: '/usr/bin/chromium',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          protocolTimeout: 60000,
          dumpio: true,
        });
        const page = await browser.newPage();
        await page.goto('https://pp.huismetbenen.nl/rankings/score-calculator/everything', { waitUntil: 'networkidle2' });

        await page.waitForSelector('input.MuiInputBase-input');

        await page.type('input.MuiInputBase-input', mapID);

        await page.click('.css-84r8tt-MuiButtonBase-root-MuiButton-root');

        await page.waitForSelector('.MuiDialog-paper');

        // Extract the result using class selectors
        const mapName = await page.$eval('input[id^=":ra:"]', el => (el as HTMLInputElement).value);
        const mods = await page.$eval('input[id^=":rb:"]', el => (el as HTMLInputElement).value);
        const maxCombo = await page.$eval('input[id^=":rc:"]', el => (el as HTMLInputElement).value);
        const accuracy = await page.$eval('input[id^=":rd:"]', el => (el as HTMLInputElement).value);
        const count300 = await page.$eval('input[id^=":re:"]', el => (el as HTMLInputElement).value);
        const count100 = await page.$eval('input[id^=":rf:"]', el => (el as HTMLInputElement).value);
        const count50 = await page.$eval('input[id^=":rg:"]', el => (el as HTMLInputElement).value);
        const missCount = await page.$eval('input[id^=":rh:"]', el => (el as HTMLInputElement).value);
        const totalPP = await page.$eval('input[id^=":ri:"]', el => (el as HTMLInputElement).value);
        const aimPP = await page.$eval('input[id^=":rj:"]', el => (el as HTMLInputElement).value);
        const tapPP = await page.$eval('input[id^=":rk:"]', el => (el as HTMLInputElement).value);
        const accPP = await page.$eval('input[id^=":rl:"]', el => (el as HTMLInputElement).value);
        const starRating = await page.$eval('input[id^=":rm:"]', el => (el as HTMLInputElement).value);

        await browser.close();

        // Format the result
        const result = `
          谱面名: ${mapName}
          最大combo: ${maxCombo}
          难度: ${starRating}星
          新的总PP: ${totalPP}
          Aim PP: ${aimPP}
          Tap PP: ${tapPP}
          Acc PP: ${accPP}
        `;

        return `谱面ID ${mapID}:\n${result}`;
      } catch (error) {
        ctx.logger.error(error);
        return '抓取谱面信息出错了！';
      }
    });
}
