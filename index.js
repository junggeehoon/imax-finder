const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const config = require('./config');

const regionCode = {
  "서울": 1,
  "경기": 2,
  "인천": 3,
  "부산": 4,
  "울산": 5,
  "대구": 6,
  "대전": 7,
  "광주": 8,
  "강원": 9,
  "경남": 10,
  "경북": 11,
  "전라": 12,
  "충청": 13,
  "제주": 14
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.user,
    pass: config.pass
  }
});

const sendMail = image => {
  const mailOptions = {
    from: 'junggeehoon@gmail.com',
    to: 'geehoon.jung@sjsu.edu',
    subject: '영화예매!!',
    text: `빨리 예매하세요!`,
    attachments: [{
      path: `./screenshot/${image}.png`
    }]
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const visitHomepage = async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    await dialog.dismiss();
  });
  const config = {
    homepage: 'http://section.cgv.co.kr/theater/popup/r_TimeTable.aspx',
    title: '어벤져스-엔드게임',
    region: '서울',
    theater: 'CGV 압구정',
    month: 05,
    day: 18
  }
  try {
    await page.setViewport({
      width: 1280,
      height: 720
    });
    await page.goto(config.homepage);
    await page.waitFor(1000);
    await page.click(`#UpdatePanel1 > ul > li.theater_tab_area > p > a:nth-child(${regionCode[config.region]})`);
    await page.waitFor(1000);

    let theater = await page.evaluate(() => {
      return document.querySelector(`#divWrap > a:nth-child(${1}) > span`).innerHTML;
    })

    let theaterCode = 1;

    while (theater !== config.theater) {
      theaterCode++;
      theater = await page.evaluate(theaterCode => {
        return document.querySelector(`#divWrap > a:nth-child(${theaterCode}) > span`).innerHTML;
      }, theaterCode)
    }
    await page.click(`#divWrap > a:nth-child(${theaterCode}) > span`);

    await page.waitFor(1000);
    
    let lastDayClass = await page.evaluate(() => {
      return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul`).lastElementChild.className;
    })
    let lastDay;
    
    let nthElement = 1;
    let dateClass = await page.evaluate(() => {
      return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${1})`).className;
    })
    let dayFlag = 0;

    if (lastDayClass === 'die') {

      while (dateClass !== 'die') {
        nthElement++;
        dateClass = await page.evaluate(nthElement => {
          return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement})`).className;
        }, nthElement)
      }
  
      lastDay = await page.evaluate(nthElement => {
        return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement - 1})`).lastElementChild.lastElementChild.innerHTML;
      }, nthElement)

    } else {
      dayFlag = 1;
      lastDay = await page.evaluate(() => {
        return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul`).lastElementChild.lastElementChild.lastElementChild.innerHTML;
      })
    }

    const date = lastDay.split('.');
    const month = Number(date[0]);
    const day = Number(date[1]);
    if (month === config.month && day >= config.day) {
      if (dayFlag === 0) {
        await page.click(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement - 1})`);
      } else {
        await page.click(`#TheaterTimeTable_UpdatePanel1 > div > div > ul`).lastElementChild;
      }
      await page.waitFor(1000);

      // const image = Date.now();
      // await page.screenshot({path: `./screenshot/${image}.png`, fullPage: true});
      // sendMail(image);
    }

    // return browser.close();

  } catch (err) {
    console.log(err);
  }
}
// setInterval(visitHomepage, 60000);
visitHomepage();