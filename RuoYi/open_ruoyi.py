from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

# 1. 配置Chrome浏览器路径
options = Options()
options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"

# 2. 配置ChromeDriver路径
service = Service(executable_path=r"D:\Git\RuoYi\ruoyi-test\chromedriver.exe")

# 3. 启动浏览器
driver = webdriver.Chrome(service=service, options=options)

# 4. 访问若依系统（初始页面）
driver.get("http://localhost:8088")
time.sleep(2)

username = driver.find_element(By.NAME,"username")
username.clear()
username.send_keys('admin')

password = driver.find_element(By.NAME,'password')
password.clear()
password.send_keys('123456')

jizhu = driver.find_element(By.ID,'rememberme')
jizhu.click()

denglu = driver.find_element(By.ID,'btnSubmit')
denglu.click()
time.sleep(2)

xitong = driver.find_element(By.XPATH,'//*[@id="side-menu"]/li[3]/a')
xitong.click()
time.sleep(2)
user_con = driver.find_element(By.XPATH,'//*[@id="side-menu"]/li[3]/ul/li[1]/a')
user_con.click()
# time.sleep(10)
# user_sou = driver.find_element(By.NAME,'loginName')
# user_sou.send_keys('admin')
# time.sleep(2)
# sousuo = driver.find_element(By.XPATH,'//*[@id="user-form"]/div/ul/li[5]/a[1]')
# sousuo.click()

time.sleep(10)
driver.quit()
# 5. 窗口控制操作
driver.maximize_window()
print("最大化后窗口位置：", driver.get_window_position())
print("最大化后窗口大小：", driver.get_window_size())
driver.set_window_size(800, 600)
print("设置后窗口位置：", driver.get_window_position())
print("设置后窗口大小：", driver.get_window_size())
print("若依页面标题：", driver.title)

# 6. 跳转到百度
driver.get("https://www.baidu.com")
print("百度页面标题：", driver.title)
print("从Ruoyi的网页中去访问百度，当前URL：", driver.current_url)
driver.save_screenshot("baidu1.png")
time.sleep(2)

# 7. 后退到若依页面
driver.back()
print("后退后页面标题：", driver.title)
print("退回到ruoyi，判断当前URL是ruoyi吗：", driver.current_url)
driver.save_screenshot("ruoyi.png")
time.sleep(2)

# 8. 前进到百度页面
driver.forward()
print("前进后页面标题：", driver.title)
print("forward前进到百度当前URL：", driver.current_url)
driver.save_screenshot("baidu2.png")
time.sleep(2)

# 9. 刷新百度页面
driver.refresh()
time.sleep(2)

# 10. 滚动到百度页面底部并截图
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
driver.save_screenshot("baidu底部.png")
time.sleep(1)

# 11. 后退到若依页面，滚动到顶部并截图
driver.back()
driver.execute_script("window.scrollTo(0, 0);")
driver.save_screenshot("ruoyi顶部.png")
time.sleep(1)

# 12. 关闭浏览器
driver.quit()