const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let browser = null;

// Inicializa o browser uma vez só
const initBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });
  }
  return browser;
};

app.get('/', (req, res) => {
  res.json({ status: 'API PDF funcionando!' });
});

app.post('/gerar-pdf', async (req, res) => {
  const { html, fileName = 'documento.pdf' } = req.body;
  
  if (!html) {
    return res.status(400).json({ error: 'HTML é obrigatório' });
  }
  
  try {
    const browser = await initBrowser();
    const page = await browser.newPage();
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    
    await page.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF: ' + error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API PDF rodando na porta ${PORT}`);
  initBrowser().then(() => console.log('Browser inicializado'));
});
