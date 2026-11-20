import {defineConfig} from "@playwright/test";
import config from "./playwright.config";
const url=new URL(process.env.PLAYWRIGHT_BASE_URL||"http://localhost:3108");
if(!["localhost","127.0.0.1"].includes(url.hostname))throw Error("Integrated QA is synthetic loopback only");
export default defineConfig({...config,workers:2,retries:0,reporter:[["list"],["json",{outputFile:"artifacts/phase4/browser-results.json"}]],outputDir:"artifacts/phase4/browser",use:{...config.use,baseURL:url.origin,launchOptions:{...config.use?.launchOptions,executablePath:process.env.CHROMIUM_EXECUTABLE}},projects:[{name:"chromium"}]});
