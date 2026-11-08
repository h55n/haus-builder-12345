const {spawn}=require('node:child_process')
const assert=require('node:assert/strict')
const {chromium}=require('playwright')
;(async()=>{
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3223'],{stdio:'ignore',env:{...process.env,MISTRAL_API_KEY:''}})
 let browser
 try{
  let ready=false;for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:3223');ready=true;break}catch{await new Promise(r=>setTimeout(r,100))}}assert.ok(ready)
  browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})})
  const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:3223')&&!route.request().url().includes('/api/')?route.continue():route.abort())
  await page.goto('http://127.0.0.1:3223',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1000)
  assert.ok((await page.locator('body').innerText()).length>30)
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/haus-home.png',fullPage:true})
  await page.setViewportSize({width:390,height:844});if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/haus-mobile.png',fullPage:true})
  await page.setViewportSize({width:1280,height:900});await page.goto('http://127.0.0.1:3223/builder',{waitUntil:'domcontentloaded'});await page.waitForSelector('canvas');await page.waitForTimeout(1200)
  const bedroom=page.locator('[role="button"]').filter({hasText:'Bedroom'}).first();const box=await bedroom.boundingBox();assert.ok(box)
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(750,450,{steps:25});await page.waitForTimeout(400);await page.mouse.up();await page.waitForTimeout(1500)
  assert.ok((await page.locator('body').innerText()).includes('1 ITEMS PLACED'),'real room drag adds one item');console.log('BUILDER',await page.locator('body').innerText())
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:process.env.SCREENSHOT_DIR+'/haus-builder.png',fullPage:true})
  assert.deepEqual(errors,[])
  console.log('Browser homepage/mobile/room-drag smoke passed without page errors. All provider requests blocked.')
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1})
