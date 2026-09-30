import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const update = process.env.UPDATE_BASELINES === "1";
const captureTarget = process.env.BASELINE_CAPTURE_TARGET === "1";
const portableComparison = process.platform === "linux";
const baselineRoot = portableComparison ? "tests/visual/baselines-linux" : "tests/visual/baselines";
const pixelThreshold = portableComparison ? 0.12 : 0;
const maxDiffPixelRatio = portableComparison ? 0.025 : 0;
const maxBlockMeanError = portableComparison ? 0.008 : 0;

function blockMeanAbsoluteError(expected: PNG, received: PNG, blockSize = 4) {
  let totalError = 0;
  let blockCount = 0;
  for (let y = 0; y < expected.height; y += blockSize) {
    for (let x = 0; x < expected.width; x += blockSize) {
      const expectedChannels = [0,0,0];
      const receivedChannels = [0,0,0];
      let pixels = 0;
      for (let offsetY = y; offsetY < Math.min(y + blockSize,expected.height); offsetY += 1) {
        for (let offsetX = x; offsetX < Math.min(x + blockSize,expected.width); offsetX += 1) {
          const index = (offsetY * expected.width + offsetX) * 4;
          for (let channel = 0; channel < 3; channel += 1) {
            expectedChannels[channel] += expected.data[index + channel];
            receivedChannels[channel] += received.data[index + channel];
          }
          pixels += 1;
        }
      }
      totalError += expectedChannels.reduce(
        (error,value,channel) => error + Math.abs(value - receivedChannels[channel]) / (pixels * 3 * 255),
        0,
      );
      blockCount += 1;
    }
  }
  return totalError / blockCount;
}
const cases = [
  ["institucional-404","http://127.0.0.1:5174/rota-inexistente","/rota-inexistente"],
  ["famtour-home","http://127.0.0.1:5173/","/famtour"],
  ["famtour-edicao","http://127.0.0.1:5173/edicoes/fernando-de-noronha-2026","/famtour/edicoes/fernando-de-noronha-2026"],
  ["famtour-inscricao","http://127.0.0.1:5173/inscricao/famtour-rn-abril-2027","/famtour/inscricao/famtour-rn-abril-2027"],
] as const;
const institutionalSections = ["sobre", "feira", "destinos", "guia", "workshop", "contato"] as const;
const viewports = [
  ["mobile",390,844],
  ["tablet",768,1024],
  ["desktop",1440,900],
] as const;

async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(250);
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
  test(`${viewportName} · institucional-home`,async ({ page }) => {
    await page.setViewportSize({ width,height });
    await page.goto("http://localhost:4173/",{ waitUntil:"load" });
    await settle(page);
    await expect(page.getByRole("heading",{ name:/conectamos pessoas, destinos e experiências/i })).toBeVisible();
    await expect(page.locator(".nw-project-card")).toHaveCount(4);
    await expect(page.getByRole("heading",{ name:"Nosso ecossistema" })).toBeVisible();
    const layout = await page.evaluate(() => ({
      documentWidth:document.documentElement.scrollWidth,
      viewportWidth:window.innerWidth,
      pageBackground:getComputedStyle(document.querySelector(".nw-home")!).backgroundColor,
      cardWidth:document.querySelector(".nw-project-card")!.getBoundingClientRect().width,
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(layout.pageBackground).toBe("rgb(255, 255, 255)");
    expect(layout.cardWidth).toBeGreaterThan(100);
    if (viewportName === "mobile") {
      await page.locator(".nw-mobile-menu summary").click();
      await expect(page.getByRole("navigation",{ name:"Navegação principal mobile" }).getByRole("link",{ name:"Contato" })).toBeVisible();
    }
  });
  test(`${viewportName} · navegação institucional atual`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://localhost:4173/");
    await page.waitForLoadState("networkidle");
    for (const section of institutionalSections) {
      if (viewportName === "mobile") await page.locator(".nw-mobile-menu summary").click();
      const menu = page.getByRole("navigation", { name: viewportName === "mobile" ? "Navegação principal mobile" : "Navegação principal", exact: true });
      await menu.locator(`a[href="#${section}"]`).click();
      await expect(page).toHaveURL(`http://localhost:4173/#${section}`);
      await expect(page.locator(`.nw-home #${section}`)).toBeInViewport();
      if (viewportName === "mobile") await expect(page.locator(".nw-mobile-menu")).not.toHaveAttribute("open");
    }
    await page.locator("#destinos").getByRole("link").click();
    await expect(page).toHaveURL("http://localhost:4173/famtour");
    await expect(page.getByRole("heading", { name: "FAMTOUR NORDESTE EDIÇÃO 2027" })).toBeVisible();
  });

  test(`${viewportName} · URLs institucionais antigas`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const section of institutionalSections) {
      await page.goto(`http://localhost:4173/${section}`);
      await expect(page).toHaveURL(`http://localhost:4173/#${section}`);
      await expect(page.locator(".nw-home")).toBeVisible();
      await expect(page.locator(`.nw-home #${section}`)).toBeInViewport();
    }
  });

  test(`${viewportName} · navegação pelas seções da FAMTOUR`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://localhost:4173/famtour?edicao=famtour-rn-abril-2027");
    await page.waitForLoadState("networkidle");
    for (const section of ["experiencia", "edicoes-anteriores", "famtours", "parceiros", "form", "inicio"]) {
      if (width < 1024) await page.getByRole("button", { name: "Abrir menu" }).click();
      await page.getByRole("navigation", { name: "Navegação FAMTOUR" }).locator(`a[href="#${section}"]:visible`).click();
      await expect(page).toHaveURL(`http://localhost:4173/famtour?edicao=famtour-rn-abril-2027#${section}`);
      await expect(page.locator(`.famtour-landing #${section}`)).toBeInViewport();
      if (width < 1024) await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
      await expect.poll(() => page.locator(`#${section}`).evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    }
    for (const section of ["experiencia", "edicoes-anteriores", "famtours", "parceiros", "inicio", "form"]) {
      await page.getByRole("contentinfo").locator(`a[href="#${section}"]`).first().click();
      await expect(page).toHaveURL(`http://localhost:4173/famtour?edicao=famtour-rn-abril-2027#${section}`);
      await expect(page.locator(`.famtour-landing #${section}`)).toBeInViewport();
    }
  });

  test(`${viewportName} · páginas FAMTOUR retornam à landing`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["edicoes/fernando-de-noronha-2026", "inscricao/famtour-rn-abril-2027"]) {
      await page.goto(`http://localhost:4173/famtour/${route}`);
      await page.waitForLoadState("networkidle");
      if (route.startsWith("edicoes/")) {
        if (width < 1024) await page.getByRole("button", { name: "Abrir menu" }).click();
        await page.getByRole("navigation", { name: "Navegação FAMTOUR" }).getByRole("link", { name: "Edições abertas" }).click();
      } else {
        await page.getByRole("banner").getByRole("link", { name: "Voltar para edições abertas" }).click();
      }
      await expect(page).toHaveURL("http://localhost:4173/famtour#famtours");
      await expect(page.locator(".famtour-landing #famtours")).toBeInViewport();
    }
  });

  for (const [name,source,target] of cases) {
    test(`${viewportName} · ${name}`,async ({ page }) => {
      await page.setViewportSize({ width,height });
      await page.emulateMedia({ reducedMotion:"reduce" });
      const url = update && !captureTarget ? source : `http://localhost:4173${target}`;
      await page.goto(url,{ waitUntil:"load" });
      await settle(page);
      const actual = await page.screenshot({ fullPage:true,animations:"disabled" });
      const baselinePath = resolve(baselineRoot,viewportName,`${name}.png`);
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
      const pixels = pixelmatch(expected.data,received.data,diff.data,expected.width,expected.height,{
        threshold:pixelThreshold,
        includeAA:!portableComparison,
      });
      const diffRatio = pixels / (expected.width * expected.height);
      const blockMeanError = portableComparison ? blockMeanAbsoluteError(expected,received) : 0;
      if (diffRatio > maxDiffPixelRatio || blockMeanError > maxBlockMeanError) {
        const diffPath = resolve("test-results/visual",viewportName,`${name}-diff.png`);
        await mkdir(dirname(diffPath),{ recursive:true });
        await writeFile(diffPath,PNG.sync.write(diff));
        await writeFile(resolve("test-results/visual",viewportName,`${name}-actual.png`),actual);
        await writeFile(resolve("test-results/visual",viewportName,`${name}-expected.png`),PNG.sync.write(expected));
      }
      expect(
        diffRatio <= maxDiffPixelRatio && blockMeanError <= maxBlockMeanError,
        `${name}: ${pixels} pixels (${(diffRatio * 100).toFixed(4)}%), erro perceptual ${(blockMeanError * 100).toFixed(4)}%`,
      ).toBe(true);
    });
  }
}
