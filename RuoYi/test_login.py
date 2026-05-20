import random
import string
import time
import pytest
import json
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def load_users_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


USERS = load_users_from_json('user.json')


def generate_unique_username():
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"yangjian_{suffix}"


def js_click(driver, element):
    driver.execute_script("arguments[0].click();", element)


def wait_blockui_gone(driver, timeout=5):
    start = time.time()
    while time.time() - start < timeout:
        overlays = driver.find_elements(By.CSS_SELECTOR, "div.blockUI.blockOverlay")
        if not overlays:
            return True
        time.sleep(0.3)
    return False


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
    time.sleep(1)
    confirm_btn = wait.until(EC.element_to_be_clickable((By.XPATH, '//div[@class="layui-layer-btn"]/a[1]')))
    js_click(driver, confirm_btn)
    print("选择部门完成")

    wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
    wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/form/div[3]/div[1]/div/div/input'))).send_keys(
        '123456')
    time.sleep(1)
    wait_blockui_gone(driver)
    save_btn = wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/div/button[1]')))
    js_click(driver, save_btn)
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

    time.sleep(1)
    wait_blockui_gone(driver)
    save_btn2 = wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/div/button[1]')))
    js_click(driver, save_btn2)
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

    time.sleep(1)
    confirm_del_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.layui-layer-btn0')))
    js_click(driver, confirm_del_btn)
    print("删除用户成功")


@pytest.mark.parametrize("user", USERS)
def test_login_with_parametrize(driver, wait, user):
    driver.get("http://localhost:8088")
    wait.until(EC.presence_of_element_located((By.NAME, "username")))

    driver.find_element(By.NAME, "username").clear()
    driver.find_element(By.NAME, "username").send_keys(user['username'])
    driver.find_element(By.NAME, 'password').clear()
    driver.find_element(By.NAME, 'password').send_keys(user['password'])
    
    driver.find_element(By.ID, 'btnSubmit').click()

    try:
        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/a')))
        assert "首页" in driver.title or "若依" in driver.title, f"用户 {user['username']} 登录失败"
        print(f"用户 {user['username']} ({user['nickname']}) 登录成功")
        
        logout_btn = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="logout"]')))
        js_click(driver, logout_btn)
        print(f"用户 {user['username']} 退出成功")
        
    except Exception as e:
        print(f"用户 {user['username']} 登录失败: {str(e)}")
        raise