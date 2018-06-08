const page = require("webpage").create();

// For console.log statements within page.evaluate()
// page.onConsoleMessage = msg => {
//   console.log(msg);
// };

// const redemptionSuffix =
//   "awardID=42238&peActivity=38013_37007&peActivity2=38031_37025";

const generateUrl = () => {
  // https://gist.github.com/6174/6062387
  const emailPrefix =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
  return `https://bananarepublicfactory.mobile-promotion.com/FusionService/promotion/Banana-Republic-Factory?id=c8fbc011a43a1e50f96b280acc74ec87fa66011c0813ba025615bcdb1f1bc96d&utm_campaign=BR_201806&utm_source=EmailGate&crmV=fmEmail&crmList=brf201806&crmSub=${emailPrefix}%40gmail.com_0`;
};

let count = 0;
page.viewportSize = { width: 1024, height: 768 };

const getTheGoods = () => {
  if (count == 10000) {
    page.close();
    phantom.exit();
    return;
  }

  page.clearCookies();

  const url = generateUrl();
  console.log("Going to: " + url);

  page.open(url).then(function(status) {
    setTimeout(() => {
      const goodCoupon = page.evaluate(() => {
        const knownImgSrcs = new Set([
          "{BC6CE4D8-6F66-4264-BA0D-B5B82F6BEDF1}.PNG", // 10%
          "{7D9A19E1-0162-4882-B6CA-D361CF88B909}.PNG" // 25%
        ]);

        const imgSrc = document
          .getElementById("prizeImageID")
          .getAttribute("src");
        const imgFileName = imgSrc.slice(imgSrc.indexOf("{"));

        if (!knownImgSrcs.has(imgFileName)) {
          console.log("Found good coupon!"); // 50% or $100 off

          document.getElementById("slotPlayButtonID").click();

          return true;
        } else {
          return false;
        }
      });

      if (goodCoupon) {
        count += 1;
        console.log("Waiting for slots animation to complete...");

        setTimeout(() => {
          page.evaluate(() => {
            document.getElementById("claimBtnID").click();
          });

          setTimeout(() => {
            page.render(count + ".png");
            console.log("Saved coupon.");

            getTheGoods();
          }, 5000); // wait out fade animation
        }, 13000); // wait out slots animation
      } else {
        getTheGoods();
      }
    }, 3000); // Wait out loading bar after page load completes
  });
};

getTheGoods();
