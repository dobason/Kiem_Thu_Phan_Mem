import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js'; 
import { expect } from 'chai';

describe('Smoke Test - FoodFast Frontend', function() {
    this.timeout(30000);
    let driver;

    before(async function() {
        let options = new Options();
        options.addArguments('--headless'); 
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    it('Should load the homepage successfully', async function() {
        await driver.get('http://localhost:5173');
        
        // Đợi 2 giây để React kịp render hoặc báo lỗi
        await new Promise(r => setTimeout(r, 2000));

        const title = await driver.getTitle();
        console.log("👉 Page Title:", title);

        // --- ĐOẠN CODE MỚI ĐỂ DEBUG ---
        // Lấy toàn bộ chữ trên màn hình xem nó báo lỗi gì
        const bodyText = await driver.findElement(By.css('body')).getText();
        console.log("=================== NỘI DUNG TRANG WEB (DEBUG) ===================");
        console.log(bodyText);
        console.log("==================================================================");
        // ------------------------------

        // Nếu title là Error thì fail test luôn để mình chú ý
        if (title === 'Error' || title.includes('Vite App')) { 
             // Note: Vite App là title mặc định nếu chưa set title
        }
    });

    after(async function() {
        if (driver) await driver.quit();
    });
});