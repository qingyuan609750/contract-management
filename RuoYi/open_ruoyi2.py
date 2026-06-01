from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

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

wait = WebDriverWait(driver,10)
quxiao = wait.until(EC.element_to_be_clickable((By.XPATH,'//*[@id="side-menu"]/li[3]/a')))
quxiao.click()

# xitong = driver.find_element(By.XPATH,)
# xitong.click()

wait = WebDriverWait(driver,5)
user_con = wait.until(EC.element_to_be_clickable((By.XPATH,'//*[@id="side-menu"]/li[3]/ul/li[1]/a')))
user_con.click()
time.sleep(1)

driver.switch_to.frame("iframe2")
time.sleep(1)

# 输入用户搜索框
login_input = driver.find_element(By.XPATH, "//input[@name='loginName']")
login_input.send_keys('yangjian')

# 点击搜索
sousuo = driver.find_element(By.XPATH,'//*[@id="user-form"]/div/ul/li[5]/a[1]')
sousuo.click()

# 点击新增按钮
xinzeng = wait.until(EC.element_to_be_clickable((By.XPATH,'//*[@id="toolbar"]/a[1]')))
xinzeng.click()
driver.switch_to.default_content()

wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH,'//*[@id="content-main"]/iframe[3]')))

# 新增用户
xinzeng_username = driver.find_element(By.XPATH,'//*[@id="form-user-add"]/div[1]/div[1]/div/div/input')
xinzeng_username.send_keys('yangjian')

selector1 = wait.until(EC.element_to_be_clickable((By.XPATH,'//*[@id="treeName"]')))
selector1.click()
driver.switch_to.default_content()


wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH,'//iframe[contains(@src,"selectDeptTree")]')))

wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div.ztree')))

dept_select = wait.until(EC.element_to_be_clickable((By.XPATH,'//*[@id="tree_3_span"]')))
dept_select.click()

confirm_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.layui-layer-btn0')))
confirm_btn.click()
driver.switch_to.default_content()

login_zh = wait.until(EC.element_to_be_clickable((By.XPATH,'/html/body/div[1]/form/div[3]/div[1]/div/div/input')))
login_zh.send_keys('123456')

save_data = driver.find_element(By.XPATH,'/html/body/div[2]/div/button[1]')
save_data.click()
driver.switch_to.default_content()

time.sleep(10)
driver.quit()



























# # 5. 窗口控制操作
# driver.maximize_window()
# print("最大化后窗口位置：", driver.get_window_position())
# print("最大化后窗口大小：", driver.get_window_size())
# driver.set_window_size(800, 600)
# print("设置后窗口位置：", driver.get_window_position())
# print("设置后窗口大小：", driver.get_window_size())
# print("若依页面标题：", driver.title)

# # 6. 跳转到百度
# driver.get("https://www.baidu.com")
# print("百度页面标题：", driver.title)
# print("从Ruoyi的网页中去访问百度，当前URL：", driver.current_url)
# driver.save_screenshot("baidu1.png")
# time.sleep(2)

# # 7. 后退到若依页面
# driver.back()
# print("后退后页面标题：", driver.title)
# print("退回到ruoyi，判断当前URL是ruoyi吗：", driver.current_url)
# driver.save_screenshot("ruoyi.png")
# time.sleep(2)

# # 8. 前进到百度页面
# driver.forward()
# print("前进后页面标题：", driver.title)
# print("forward前进到百度当前URL：", driver.current_url)
# driver.save_screenshot("baidu2.png")
# time.sleep(2)

# # 9. 刷新百度页面
# driver.refresh()
# time.sleep(2)

# # 10. 滚动到百度页面底部并截图
# driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
# driver.save_screenshot("baidu底部.png")
# time.sleep(1)

# # 11. 后退到若依页面，滚动到顶部并截图
# driver.back()
# driver.execute_script("window.scrollTo(0, 0);")
# driver.save_screenshot("ruoyi顶部.png")
# time.sleep(1)

# 12. 关闭浏览器
driver.quit()