from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import time
import random
import string

# 配置Chrome浏览器
options = Options()
options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"
# options.add_argument('--no-sandbox')
# options.add_argument('--disable-dev-shm-usage')
# options.add_argument('--disable-gpu')

# 生成唯一的用户账号
suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
unique_username = f"yangjian_{suffix}"

# 配置ChromeDriver
service = Service(executable_path=r"D:\Git\RuoYi\ruoyi-test\chromedriver.exe")
 
# 启动浏览器
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 10)

# 访问若依系统
driver.get("http://localhost:8088")
time.sleep(2)

# 登录
driver.find_element(By.NAME, "username").clear()
driver.find_element(By.NAME, "username").send_keys('admin')
driver.find_element(By.NAME, 'password').clear()
driver.find_element(By.NAME, 'password').send_keys('123456')
driver.find_element(By.ID, 'rememberme').click()
driver.find_element(By.ID, 'btnSubmit').click()

# 进入系统管理-用户管理
wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/a'))).click()
wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/ul/li[1]/a'))).click()
time.sleep(1)

# 切换到用户列表iframe
driver.switch_to.frame("iframe2")
time.sleep(1)

# 搜索用户
driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(unique_username)
driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()

# 点击新增
wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="toolbar"]/a[1]'))).click()
driver.switch_to.default_content()

# 切换到新增iframe
wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))

# 填写用户信息
driver.find_element(By.XPATH, '//*[@id="form-user-add"]/div[1]/div[1]/div/div/input').send_keys(unique_username)
driver.find_element(By.XPATH, '//input[@placeholder="请输入登录账号"]').send_keys(unique_username)

# 选择部门
wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="treeName"]'))).click()
driver.switch_to.default_content()
wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//iframe[contains(@src,"selectDeptTree")]')))
wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="tree_3_span"]'))).click()

# 确认部门
driver.switch_to.default_content()
wait.until(EC.element_to_be_clickable((By.XPATH, '//div[@class="layui-layer-btn"]/a[1]'))).click()

# 回到新增iframe，输入密码并保存
wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/form/div[3]/div[1]/div/div/input'))).send_keys('123456')
driver.find_element(By.XPATH, '/html/body/div[2]/div/button[1]').click()
driver.switch_to.default_content()
time.sleep(2)

# ===================== 修改用户 =====================
driver.switch_to.default_content()
time.sleep(3)
wait.until(EC.frame_to_be_available_and_switch_to_it((By.NAME, "iframe2")))
time.sleep(2)

# 搜索用户
driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(unique_username)
driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
time.sleep(3)

# 勾选用户（打括号的对号）
checkbox = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
if not checkbox.is_selected():
    checkbox.click()

# 点击编辑
wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"edit")]'))).click()
driver.switch_to.default_content()
time.sleep(2)

# 切换到编辑iframe
wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))

# 修改昵称
nickname_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='userName']")))
nickname_input.clear()
nickname_input.send_keys(f'{unique_username}_修改')

# 保存修改
wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/div/button[1]'))).click()
driver.switch_to.default_content()
time.sleep(2)

# ===================== 删除用户 =====================
driver.switch_to.default_content()
time.sleep(3)
wait.until(EC.frame_to_be_available_and_switch_to_it((By.NAME, "iframe2")))
time.sleep(2)

# 搜索用户
driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(unique_username)
driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
time.sleep(2)

# 勾选用户
checkbox = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
if not checkbox.is_selected():
    checkbox.click()

# 点击删除
wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"remove")]'))).click()
driver.switch_to.default_content()
time.sleep(2)

# 确认删除
wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.layui-layer-btn0'))).click()
time.sleep(3)


driver.quit()