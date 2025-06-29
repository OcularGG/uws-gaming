const https = require('https');

async function fetchPorts() {
  return new Promise((resolve, reject) => {
    const url = 'https://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json';

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const ports = jsonData.filter(item =>
            item.__type === "MegaChaka.Services.Items.PortItemTemplate, MegaChaka"
          );
          const portNames = ports.map(port => port.Name).sort();

          console.log('Port names found:', portNames.length);
          console.log('First 10 ports:', portNames.slice(0, 10));
          console.log('\nAll ports as TypeScript array:');
          console.log('export const NAVAL_ACTION_PORTS = [');
          portNames.forEach(name => {
            console.log(`  "${name}",`);
          });
          console.log('];');

          resolve(portNames);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

fetchPorts().catch(console.error);
