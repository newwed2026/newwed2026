import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const update = process.env.UPDATE_BASELINES === "1";
const cases = [
  ["institucional-home","http://127.0.0.1:5174/","/"],
  ["institucional-sobre","http://127.0.0.1:5174/sobre","/sobre"],
  ["institucional-feira","http://127.0.0.1:5174/feira","/feira"],
  ["institucional-destinos","http://127.0.0.1:5174/destinos","/destinos"],
  ["institucional-guia","http://127.0.0.1:5174/guia","/guia"],
  ["institucional-workshop","http://127.0.0.1:5174/workshop","/workshop"],
  ["institucional-contato","http://127.0.0.1:5174/contato","/contato"],
  ["institucional-404","http://127.0.0.1:5174/rota-inexistente","/rota-inexistente"],
  ["famtour-home","http://127.0.0.1:5173/","/famtour"],
  ["famtour-edicao","http://127.0.0.1:5173/edicoes/fernando-de-noronha-2026","/famtour/edicoes/fernando-de-noronha-2026"],
  ["famtour-inscricao","http://127.0.0.1:5173/inscricao/famtour-rn-abril-2027","/famtour/inscricao/famtour-rn-abril-2027"],
] as const;
const viewports = [
  ["mobile",390,844],
  ["tablet",768,1024],
  ["desktop",1440,900],
] as const;

async function settle(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.evaluate(async () => {
    for (const image of Array.from(document.images)) image.loading = "eager";
    await Promise.race([document.fonts.ready,new Promise((resolve) => setTimeout(resolve,3000))]);
    await Promise.race([
      Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.addEventListener("load",()=>resolve(),{once:true}); image.addEventListener("error",()=>resolve(),{once:true}); }))),
      new Promise((resolve) => setTimeout(resolve,3000)),
    ]);
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(250);
}

for (const [viewportName,width,height] of viewports) {
  for (const [name,source,target] of cases) {
    test(`${viewportName} · ${name}`,async ({ page }) => {
      await page.setViewportSize({ width,height });
      await page.goto(update ? source : `http://localhost:4173${target}`,{ waitUntil:"load" });
      await settle(page);
      const actual = await page.screenshot({ fullPage:true,animations:"disabled" });
      const baselinePath = resolve("tests/visual/baselines",viewportName,`${name}.png`);
      if (update) {
        await mkdir(dirname(baselinePath),{ recursive:true });
        await writeFile(baselinePath,actual);
        return;
      }
      const expected = PNG.sync.read(await readFile(baselinePath));
      const received = PNG.sync.read(actual);
      expect(received.width,`largura divergente em ${name}`).toBe(expected.width);
      expect(received.height,`altura divergente em ${name}`).toBe(expected.height);
      const diff = new PNG({ width:expected.width,height:expected.height });
      const pixels = pixelmatch(expected.data,received.data,diff.data,expected.width,expected.height,{ threshold:0,includeAA:true });
      if (pixels) {
        const diffPath = resolve("test-results/visual",viewportName,`${name}-diff.png`);
        await mkdir(dirname(diffPath),{ recursive:true });
        await writeFile(diffPath,PNG.sync.write(diff));
      }
      expect(pixels,`${name} divergiu em ${pixels} pixels`).toBe(0);
    });
  }
}
