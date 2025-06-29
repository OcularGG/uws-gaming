// Temporary script to parse ports from the JSON data
async function fetchPorts() {
  try {
    const response = await fetch('https://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json');
    const data = await response.json();

    const ports = data.filter(item => item.__type === "MegaChaka.Services.Items.PortItemTemplate, MegaChaka");
    const portNames = ports.map(port => port.Name).sort();

    console.log('Port names found:', portNames.length);
    console.log(JSON.stringify(portNames, null, 2));

    return portNames;
  } catch (error) {
    console.error('Error fetching ports:', error);
  }
}

// For browser console
if (typeof window !== 'undefined') {
  window.fetchPorts = fetchPorts;
}

// For Node.js
if (typeof module !== 'undefined') {
  module.exports = { fetchPorts };
}
