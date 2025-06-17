import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { DevTools } from '@tolgee/react';
import { Tolgee } from '@tolgee/react';

function writeFile(fileName: string, content: string, extension = 'json') {
    const dirname = path.dirname(fileName);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(`${fileName}.${extension}`, content, {
        encoding: 'utf8',
        flag: 'w',
    });
}

const apiUrl = 'https://tolgee.sabagame.com';
const languageCodes = ['en', 'id', 'th', 'vi', 'zh-Hans-CN', 'zh-Hant-TW'];

const projects = [
    {
        name: 'GameClient',
        projectId: '5', 
        apiKey: 'tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc', 
        onlyNamespaces: ['PromotionCampaign'],
    },
    {
        name: 'GamePromotion',
        projectId: '8',
        apiKey: 'tgpat_vd1qb85l15uk7u2p390bp7g5qd3akjtt3pk5rqicai5g9o5a8j4',
        onlyNamespaces: null, 
    },
];

async function fetchNamespaces(projectId: string, apiKey: string) {
    const res = await axios.get(`${apiUrl}/v2/projects/${projectId}/namespaces`, {
        headers: { 'X-API-Key': apiKey },
    });
    return res.data._embedded.namespaces.map((ns: any) => ns.name);
}

async function fetchTranslations(projectId: string, apiKey: string, namespace: string, language: string) {
    const res = await axios.get(`${apiUrl}/v2/projects/${projectId}/translations/export?languages=${language}&namespace=${namespace}`, {
        headers: { 'X-API-Key': apiKey },
    });
    return res.data[language]?.[namespace] || {};
}

(async () => {
    for (const project of projects) {
        let namespaces: string[] = [];
        if (project.onlyNamespaces) {
            namespaces = project.onlyNamespaces;
        } else {
            namespaces = await fetchNamespaces(project.projectId, project.apiKey);
        }
        for (const namespace of namespaces) {
            const languageFolder = `./public/i18n/${namespace}/`;
            
            const tg = Tolgee().use(DevTools()).init({
                defaultLanguage: "en",
                availableLanguages: languageCodes,
                apiKey: project.apiKey,
                apiUrl: apiUrl,
                projectId: project.projectId,
                defaultNs: namespace,
                ns: [namespace]
            });
            
            tg.run();
            
            tg.on("initialLoad", async () => {
                const languages: {
                    [languageId: string]: {
                        [ns: string]: {
                            [key: string]: string;
                        };
                    };
                } = {};   
            
                for (let index = 0; index < languageCodes.length; index++) {
                    const languageId = languageCodes[index];
            
                    await tg.changeLanguage(languageId);
                    languages[languageId] = {};
                    tg.getAllRecords().forEach((record) => {
                        if (record.namespace == namespace) {
                            languages[languageId][namespace] = {};
                            record.data.forEach((value, key) => {
                                languages[languageId][namespace][key] = value as string;
            
                                
                            });
                        }
                    });        
            
                    writeFile(languageFolder + languageId, JSON.stringify(languages[languageId][namespace], null, 4));
                }
            
                console.log("Generated done!");
            });
            
        }
    }
    console.log('All projects, namespaces and languages generated!');
})();
