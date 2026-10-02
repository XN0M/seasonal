import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
// Deliberately short test-only password exercises the owner-requested length policy.
const email='owner@example.invalid',password='demo'
test('loopback setup, login, protected data, logout and responsive accessible form',async({page,request})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 await page.goto('/_manage/');await expect(page.getByRole('heading',{name:'Đặt mật khẩu admin'})).toBeVisible()
 await page.getByLabel('Email quản trị').fill(email)
 await page.getByLabel('Mật khẩu',{exact:true}).fill(password)
 await page.getByLabel('Nhập lại mật khẩu').fill(password)
 await page.getByRole('button',{name:'Tạo tài khoản quản trị'}).click()
 await expect(page.getByRole('button',{name:'Đăng nhập',exact:true})).toBeEnabled()
 for(const width of [375,768,1024,1440]){
  await page.setViewportSize({width,height:900})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
  await page.screenshot({path:'docs/qa/password-login-'+width+'.png',fullPage:true,scale:'css'})
 }
 expect((await request.get('/_manage/api/bootstrap')).status()).toBe(401)
 await page.getByLabel('Email quản trị').fill(email);await page.getByLabel('Mật khẩu',{exact:true}).fill('not a valid password');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click()
 await expect(page.locator('#message')).toContainText('không đúng')
 await page.getByLabel('Mật khẩu',{exact:true}).fill(password);await page.getByLabel('Mật khẩu',{exact:true}).press('Enter')
 await expect(page.getByRole('heading',{name:'Không gian quản trị'})).toBeVisible();await expect(page.locator('#notice')).toContainText('Đã tải dữ liệu')
 expect((await page.request.get('/_manage/api/bootstrap')).status()).toBe(200)
 await page.getByRole('button',{name:'Links',exact:true}).click();await expect(page.getByRole('heading',{name:'Tạo link chuyển nhanh'})).toBeVisible()
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
 const cookie=await page.context().cookies();expect(cookie.some(item=>item.name==='seasonal_admin_local'&&item.httpOnly&&item.sameSite==='Strict')).toBe(true)
 await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page.getByRole('button',{name:'Đăng nhập',exact:true})).toBeEnabled()
 expect((await page.request.get('/_manage/api/bootstrap')).status()).toBe(401)
 expect(errors).toEqual([])
})
