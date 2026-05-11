import random
import string
import time
import pytest
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

def generate_unique_username():
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"yangjian_{suffix}"

def test_login_and_user_operations(driver, wait):
    unique_username = generate_unique_username()
    
    driver.get("http://localhost:8088")
    wait.until(EC.presence_of_element_located((By.NAME, "username")))
    
    driver.find_element(By.NAME, "username").clear()
    driver.find_element(By.NAME, "username").send_keys('admin')
    driver.find_element(By.NAME, 'password').clear()
    driver.find_element(By.NAME, 'password').send_keys('123456')
    driver.find_element(By.ID, 'rememberme').click()
    driver.find_element(By.ID, 'btnSubmit').click()
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/a')))
    assert "首页" in driver.title or "若依" in driver.title, "登录失败"
    print("登录成功")
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/a'))).click()
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/ul/li[1]/a'))).click()
    
    wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
    print("进入用户管理页面")
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']"))).send_keys(unique_username)
    driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="toolbar"]/a[1]'))).click()
    driver.switch_to.default_content()
    
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
    print("进入新增用户页面")
    
    driver.find_element(By.XPATH, '//*[@id="form-user-add"]/div[1]/div[1]/div/div/input').send_keys(unique_username)
    driver.find_element(By.XPATH, '//input[@placeholder="请输入登录账号"]').send_keys(unique_username)
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="treeName"]'))).click()
    driver.switch_to.default_content()
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//iframe[contains(@src,"selectDeptTree")]')))
    wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="tree_3_span"]'))).click()
    
    driver.switch_to.default_content()
    wait.until(EC.element_to_be_clickable((By.XPATH, '//div[@class="layui-layer-btn"]/a[1]'))).click()
    print("选择部门完成")
    
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
    wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/form/div[3]/div[1]/div/div/input'))).send_keys('123456')
    driver.find_element(By.XPATH, '/html/body/div[2]/div/button[1]').click()
    print("保存用户成功")
    
    time.sleep(2)
    driver.switch_to.default_content()
    wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
    wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']")))
    
    driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
    driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(unique_username)
    driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
    time.sleep(1)
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
    checkbox = driver.find_element(By.XPATH, "//input[@name='btSelectItem']")
    if not checkbox.is_selected():
        checkbox.click()
    print("勾选用户")
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"edit")]'))).click()
    driver.switch_to.default_content()
    
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
    
    nickname_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='userName']")))
    nickname_input.clear()
    nickname_input.send_keys(f'{unique_username}_修改')
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/div/button[1]'))).click()
    print("修改用户成功")
    
    time.sleep(2)
    driver.switch_to.default_content()
    wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
    wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']")))
    
    driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
    driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(unique_username)
    driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
    time.sleep(1)
    
    wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
    checkbox2 = driver.find_element(By.XPATH, "//input[@name='btSelectItem']")
    if not checkbox2.is_selected():
        checkbox2.click()
    print("勾选用户准备删除")
    
    wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"remove")]'))).click()
    driver.switch_to.default_content()
    
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.layui-layer-btn0'))).click()
    print("删除用户成功")