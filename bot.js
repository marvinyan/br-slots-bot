const page = require('webpage').create();

// For console.log statements within page.evaluate()
// page.onConsoleMessage = msg => {
//   console.log(msg);
// };

// const redemptionSuffix =
//   "awardID=42238&peActivity=38013_37007&peActivity2=38031_37025";

const generateEmail = () => {
  // https://gist.github.com/6174/6062387
  const emailPrefix =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
  return `${emailPrefix}%40gmail.com_0`;
};

let couponCount = 0;
let attempts = 0;

page.viewportSize = { width: 1024, height: 768 };
const url =
  'https://bananarepublicfactory.mobile-promotion.com/FusionService/promotion/Banana-Republic-Factory?id=c8fbc011a43a1e50f96b280acc74ec87fa66011c0813ba025615bcdb1f1bc96d&utm_campaign=BR_201806&utm_source=EmailGate&crmV=fmEmail&crmList=brf201806&crmSub=';

const getTheGoods = () => {
  if (couponCount == 1000) {
    page.close();
    phantom.exit();
    return;
  }

  phantom.clearCookies();

  const email = generateEmail();
  console.log(`Using email ${attempts}: ${email.replace('%40', '@').slice(0, -2)} | Luck: ${
    attempts !== 0 ? couponCount / attempts : '-'
  }`);
  attempts++;

  page.open(url + email).then((status) => {
    setTimeout(() => {
      const goodCoupon = page.evaluate(() => {
        const knownImgSrcs = new Set([
          '{BC6CE4D8-6F66-4264-BA0D-B5B82F6BEDF1}.PNG', // 10%
          '{7D9A19E1-0162-4882-B6CA-D361CF88B909}.PNG', // 25%
        ]);

        const imgSrc = document.getElementById('prizeImageID').getAttribute('src');
        const imgFileName = imgSrc.slice(imgSrc.indexOf('{'));

        if (!knownImgSrcs.has(imgFileName)) {
          document.getElementById('slotPlayButtonID').click();

          return true;
        }
        return false;
      });

      if (goodCoupon) {
        couponCount++;
        console.log('Waiting for slots animation to complete...');

        setTimeout(() => {
          page.evaluate(() => {
            document.getElementById('claimBtnID').click();
          });

          setTimeout(() => {
            // Can't get page.evaluate to work with iframe fuckery
            // const filename = page.evaluate(() => {
            //   console.log(document.documentElement.outerHTML);
            //   return document.querySelector(".barcode-text").textContent;
            // });

            page.render(`./output/${couponCount}.png`);
            console.log('Saved coupon.');

            getTheGoods();
          }, 10000); // wait out fade animation
        }, 13000); // wait out slots animation
      } else {
        getTheGoods();
      }
    }, 3000); // Wait out loading bar after page load completes
  });
};

getTheGoods();
