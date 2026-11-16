import { log } from 'console';
import { createPlaywrightRouter } from 'crawlee';
import inquirer from 'inquirer';
import { IdealoResponse } from './models/idealo.model.js';
import { Cpu, Drive, Gpu, PassmarkResponse } from './models/passmark.model.js';
import { NormComponent, Product } from './models/state.model.js';
import { state } from './state.js';
import { CONFIG, CURRENCY_PARSER, EN_US_NUMBER_PARSER, IDEALO_PRICE_SELECTOR, IDEALO_SUGGEST_LIMIT, OLLAMA, REGION_TO_IDEALO_DATA } from './utils/constants.js';
import { extractYear, getCompareFn, normalizeSize } from './utils/utils.js';

export const router = createPlaywrightRouter();

router.addHandler('cpu-list', async ({ sendRequest, addRequests }) => {
    log('Scraping CPUs...');

    const res: PassmarkResponse<Cpu> = await sendRequest({
        url: 'https://www.cpubenchmark.net/data/?_=' + new Date().getTime(),
        headers: new Headers({
            "x-requested-with": "XMLHttpRequest"
        }),
    }).then(r => r.json());

    const filter = CONFIG.filter;

    const reqs = res
        .data
        .map(c => {
            const normYear = extractYear(c.date);
            const normCpumark = EN_US_NUMBER_PARSER.parse(c.cpumark);

            return { ...c, normYear, normCpumark };
        })
        .filter(c => (!filter.cpu["year.min"] || c.normYear >= filter.cpu["year.min"])
            && (!filter.cpu["year.max"] || c.normYear < filter.cpu["year.max"])
            && (!filter.cpu.category || c.cat.includes(filter.cpu.category))
            && (!filter.cpu.sockets || filter.cpu.sockets.includes(c.socket))
            && (!filter.cpu["cpumark.min"] || c.normCpumark >= filter.cpu["cpumark.min"])
            && (!filter.cpu["cpumark.max"] || c.normCpumark < filter.cpu["cpumark.max"]))
        .sort(getCompareFn(filter.cpu["sort.by"] as any, filter.cpu["sort.direction"]))
        .slice(0, filter.cpu.limit)
        .map(c => ({
            url: `https://www.idealo.${CONFIG.region}/suggest?q=${c.name}&max=${IDEALO_SUGGEST_LIMIT}`,
            label: 'idealo-suggest',
            userData: { objType: 'cpu', ...c }
        }));

    await addRequests(reqs);
});

router.addHandler('gpu-list', async ({ sendRequest, addRequests }) => {
    log('Scraping GPUs...');

    const res: PassmarkResponse<Gpu> = await sendRequest({
        url: 'https://www.videocardbenchmark.net/data/?_=' + new Date().getTime(),
        headers: new Headers({
            "x-requested-with": "XMLHttpRequest"
        }),
    }).then(r => r.json());

    const filter = CONFIG.filter;

    const reqs = res
        .data
        .map(g => {
            const normYear = extractYear(g.date);
            const normVram = g.memSize !== 'NA' ? normalizeSize(g.memSize) : -1;
            const normG3d = EN_US_NUMBER_PARSER.parse(g.g3d);

            return { ...g, normYear, normVram, normG3d };
        })
        .filter(g => (!filter.gpu["year.min"] || g.normYear >= filter.gpu["year.min"])
            && (!filter.gpu["year.max"] || g.normYear < filter.gpu["year.max"])
            && (!filter.gpu.category || g.cat.includes(filter.gpu.category))
            && (!filter.gpu["vram.min"] || g.normVram >= filter.gpu["vram.min"])
            && (!filter.gpu["vram.max"] || g.normVram < filter.gpu["vram.max"])
            && (!filter.gpu["g3d.min"] || g.normG3d >= filter.gpu["g3d.min"])
            && (!filter.gpu["g3d.max"] || g.normG3d < filter.gpu["g3d.max"]))
        .sort(getCompareFn(filter.gpu["sort.by"] as any, filter.gpu["sort.direction"]))
        .slice(0, filter.gpu.limit)
        .map(g => ({
            url: `https://www.idealo.${CONFIG.region}/suggest?q=${g.name}&max=${IDEALO_SUGGEST_LIMIT}`,
            label: 'idealo-suggest',
            userData: { objType: 'gpu', ...g }
        }));

    await addRequests(reqs);
});

router.addHandler('hdd-list', async ({ sendRequest, addRequests }) => {
    log('Scraping SSDs/HDDs...');

    const res: PassmarkResponse<Drive> = await sendRequest({
        url: 'https://www.harddrivebenchmark.net/data/?_=' + new Date().getTime(),
        headers: new Headers({
            "x-requested-with": "XMLHttpRequest"
        }),
    }).then(r => r.json());

    const filter = CONFIG.filter;

    const drives = res
        .data
        .map(d => {
            const normYear = extractYear(d.date);
            const normSize = normalizeSize(d.size) / 1_024;
            const normDiskmark = EN_US_NUMBER_PARSER.parse(d.diskmark);

            return { ...d, normYear, normSize, normDiskmark };
        });
    const ssdReqs = drives
        .filter(s => s.type === 'SSD'
            && filter.ssd.enable
            && (!filter.ssd["year.min"] || s.normYear >= filter.ssd["year.min"])
            && (!filter.ssd["year.max"] || s.normYear < filter.ssd["year.max"])
            && (!filter.ssd["size.min"] || s.normSize >= filter.ssd["size.min"])
            && (!filter.ssd["size.max"] || s.normSize < filter.ssd["size.max"])
            && (!filter.ssd["diskmark.min"] || s.normDiskmark >= filter.ssd["diskmark.min"])
            && (!filter.ssd["diskmark.max"] || s.normDiskmark < filter.ssd["diskmark.max"]))
        .sort(getCompareFn(filter.ssd["sort.by"] as any, filter.ssd["sort.direction"]))
        .slice(0, filter.ssd.limit)
        .map(s => ({
            url: `https://www.idealo.${CONFIG.region}/suggest?q=${s.name}&max=${IDEALO_SUGGEST_LIMIT}`,
            label: 'idealo-suggest',
            userData: { objType: 'ssd', ...s }
        }));
    const hddReqs = drives
        .filter(h => h.type === 'HDD'
            && filter.hdd.enable
            && (!filter.hdd["year.min"] || h.normYear >= filter.hdd["year.min"])
            && (!filter.hdd["year.max"] || h.normYear < filter.hdd["year.max"])
            && (!filter.hdd["size.min"] || h.normSize >= filter.hdd["size.min"])
            && (!filter.hdd["size.max"] || h.normSize < filter.hdd["size.max"])
            && (!filter.hdd["diskmark.min"] || h.normDiskmark >= filter.hdd["diskmark.min"])
            && (!filter.hdd["diskmark.max"] || h.normDiskmark < filter.hdd["diskmark.max"]))
        .sort(getCompareFn(filter.hdd["sort.by"] as any, filter.hdd["sort.direction"]))
        .slice(0, filter.hdd.limit)
        .map(h => ({
            url: `https://www.idealo.${CONFIG.region}/suggest?q=${h.name}&max=${IDEALO_SUGGEST_LIMIT}`,
            label: 'idealo-suggest',
            userData: { objType: 'hdd', ...h }
        }));

    await addRequests([ ...ssdReqs, ...hddReqs ]);
});

router.addHandler('idealo-suggest', async ({ request, page, addRequests }) => {
    const component: NormComponent = request.userData;

    log(`Scraping Idealo suggestions for ${component.name}...`);

    const urlPrefix = `https://www.idealo.${CONFIG.region}/${REGION_TO_IDEALO_DATA[CONFIG.region].urlPrefix}/`;
    const location = REGION_TO_IDEALO_DATA[CONFIG.region].cats[component.objType];

    const json = await page.locator('pre').textContent();
    const suggestions = (JSON.parse(json!) as IdealoResponse)
        .groups[0]
        ?.items
        .filter(s => s.url.startsWith(urlPrefix) && s.location === location);

    if (suggestions?.length) {
        const compDetails = Object.entries(component).map(([k, v]) => `${k}: ${v}`).join('\n');
        let indexes: number[];

        if (CONFIG.ollama?.enable) {
            log(`Asking ${CONFIG.ollama.model}...`);

            const prompt = 'Return ONLY the comma-separated indexes of the following products that match the given component. Return -1 if there is no match.\n\n'
                + 'GIVEN COMPONENT\n'
                + compDetails + '\n\n'
                + 'LIST OF PRODUCTS\n'
                + suggestions.map((s, i) => `${i}. ${s.titlePlain}`).join('\n');

            log(prompt);

            const res = await OLLAMA.chat({
                model: CONFIG.ollama.model,
                messages: [{ role: 'user', content: prompt }],
                think: CONFIG.ollama.think
            });

            log('Response: ' + res.message.content);

            indexes = res.message.content !== "-1"
                ? res.message.content.split(',').map(s => +s)
                : [];
        } else {
            log('COMPONENT DETAILS\n' + compDetails);

            const answers = await inquirer.prompt<{ products: number[] }>([
                {
                    type: 'checkbox',
                    message: 'Select the products that match the given component',
                    name: 'products',
                    choices: suggestions.map((s, i) => ({
                        name: s.titlePlain,
                        value: i,
                        checked: s.titlePlain.toLowerCase() === component.name.toLowerCase()
                    }))
                }
            ]);

            indexes = answers.products;
        }

        if (indexes.length) {
            const reqs = suggestions
                .filter((_, i) => indexes.includes(i))
                .map((s) => ({
                    url: s.url,
                    label: 'idealo-price',
                    userData: {
                        ...component,
                        idealoName: s.titlePlain,
                        idealoUrl: s.url
                    }
                }));

            await addRequests(reqs);
        } else {
            log(`No selection :c`);
        }
    } else {
        log(`No suggestions :c`);
    }
});

router.addHandler('idealo-price', async ({ request, page }) => {
    const product: Product = { ...request.userData, label: undefined };

    log(`Scraping Idealo price for ${product.idealoName} (${product.name})...`);

    const priceLabel = await page.locator(IDEALO_PRICE_SELECTOR).first().innerText();
    const priceString = priceLabel.replaceAll(" " + REGION_TO_IDEALO_DATA[CONFIG.region].priceSuffix, "");
    const idealoPrice = CURRENCY_PARSER.parse(priceString);

    state.products.push({ ...product, idealoPrice });
});
