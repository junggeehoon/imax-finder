const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const config = require('./config');

const regionCode = {
  "서울": 1,
  "경기": 2,
  "인천": 3,
  "강원": 4,
  "대전": 5,
  "충청": 5,
  "대구": 6,
  "부산": 7,
  "울산": 7,
  "경상": 8,
  "광주": 9,
  "전라": 9,
  "제주": 9
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
    homepage: 'http://www.cgv.co.kr/reserve/show-times/',
    title: '어벤져스-엔드게임',
    region: '서울',
    theater: 'CGV압구정',
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

    await page.click(`#contents > div.sect-common > div > div.sect-city > ul > li:nth-child(${regionCode[config.region]})`); //지역선택

    
    let nthElement = 1;
    let theater = await page.evaluate(() => {
      return document.querySelector(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${1}) > a`).innerHTML;
    })

    while (theater !== config.theater) {
      nthElement++;
      theater = await page.evaluate(nthElement => {
        return document.querySelector(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${nthElement}) > a`).innerHTML;
      }, nthElement)

    }
    await page.click(`#contents > div.sect-common > div > div.sect-city > ul > li.on > div > ul > li:nth-child(${nthElement})`); //극장선택
    await page.waitFor(1000);
    
    let lastDay = await page.evaluate(() => {
      return document.querySelector('#slider > div > ul > li:nth-child(3)').lastElementChild.innerHTML;
    })

    console.log(lastDay);

    // let daySelection = 0;

    // if (lastDayClass === 'die') {

    //   while (dateClass !== 'die') {
    //     nthElement++;
    //     dateClass = await page.evaluate(nthElement => {
    //       return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement})`).className;
    //     }, nthElement)
    //   }



    // await page.click(`#UpdatePanel1 > ul > li.theater_tab_area > p > a:nth-child(${regionCode[config.region]})`);
    // await page.waitFor(1000);

    // let theater = await page.evaluate(() => {
    //   return document.querySelector(`#divWrap > a:nth-child(${1}) > span`).innerHTML;
    // })

    // let theaterCode = 1;

    // while (theater !== config.theater) {
    //   theaterCode++;
    //   theater = await page.evaluate(theaterCode => {
    //     return document.querySelector(`#divWrap > a:nth-child(${theaterCode}) > span`).innerHTML;
    //   }, theaterCode)
    // }
    // await page.click(`#divWrap > a:nth-child(${theaterCode}) > span`);
    
    // let lastDayClass = await page.evaluate(() => {
    //   return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul`).lastElementChild.className;
    // })
    // let lastDay;
    
    // let nthElement = 1;
    // let dateClass = await page.evaluate(() => {
    //   return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${1})`).className;
    // })
    // let daySelection = 0;

    // if (lastDayClass === 'die') {

    //   while (dateClass !== 'die') {
    //     nthElement++;
    //     dateClass = await page.evaluate(nthElement => {
    //       return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement})`).className;
    //     }, nthElement)
    //   }
  
    //   lastDay = await page.evaluate(nthElement => {
    //     return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement - 1})`).lastElementChild.lastElementChild.innerHTML;
    //   }, nthElement)

    // } else {
    //   daySelection = 1;
    //   lastDay = await page.evaluate(() => {
    //     return document.querySelector(`#TheaterTimeTable_UpdatePanel1 > div > div > ul`).lastElementChild.lastElementChild.lastElementChild.innerHTML;
    //   })
    // }

    // const date = lastDay.split('.');
    // const month = Number(date[0]);
    // const day = Number(date[1]);
    // if (month === config.month && day >= config.day) {
    //   if (daySelection === 0) {
    //     await page.click(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li:nth-child(${nthElement - 1})`);
    //   } else {
    //     await page.click(`#TheaterTimeTable_UpdatePanel1 > div > div > ul > li`).lastElementChild;
    //   }
    //   await page.waitFor(1000);

    //   // const image = Date.now();
    //   // await page.screenshot({path: `./screenshot/${image}.png`, fullPage: true});
    //   // sendMail(image);
    // }

    // return browser.close();

  } catch (err) {
    console.log(err);
  }
}
// setInterval(visitHomepage, 60000);
visitHomepage();