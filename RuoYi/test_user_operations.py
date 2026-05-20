import random
import string
import time
import allure
import pytest
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def generate_unique_username():
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"yangjian_{suffix}"


@allure.feature("用户管理")
@allure.story("登录及用户CRUD操作")
class TestUserOperations:

    @allure.step("生成唯一用户名")
    def generate_unique_username(self):
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        return f"yangjian_{suffix}"

    @allure.step("登录系统")
    def login(self, driver, wait):
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
        allure.attach("登录成功", name="登录状态", attachment_type=allure.attachment_type.TEXT)

    @allure.step("进入用户管理页面")
    def enter_user_management(self, driver, wait):
        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/a'))).click()
        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="side-menu"]/li[3]/ul/li[1]/a'))).click()
        wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
        allure.attach("已进入用户管理页面", name="页面状态", attachment_type=allure.attachment_type.TEXT)

    @allure.step("搜索用户: {username}")
    def search_user(self, driver, wait, username):
        wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']"))).send_keys(username)
        driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
        time.sleep(1)

    @allure.step("新增用户: {username}")
    def add_user(self, driver, wait, username):
        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="toolbar"]/a[1]'))).click()
        driver.switch_to.default_content()

        wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
        allure.attach("进入新增用户页面", name="页面状态", attachment_type=allure.attachment_type.TEXT)

        driver.find_element(By.XPATH, '//*[@id="form-user-add"]/div[1]/div[1]/div/div/input').send_keys(username)
        driver.find_element(By.XPATH, '//input[@placeholder="请输入登录账号"]').send_keys(username)

        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="treeName"]'))).click()
        driver.switch_to.default_content()
        wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//iframe[contains(@src,"selectDeptTree")]')))
        wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="tree_3_span"]'))).click()

        driver.switch_to.default_content()
        wait.until(EC.element_to_be_clickable((By.XPATH, '//div[@class="layui-layer-btn"]/a[1]'))).click()
        allure.attach("选择部门完成", name="操作状态", attachment_type=allure.attachment_type.TEXT)

        wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))
        wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/form/div[3]/div[1]/div/div/input'))).send_keys('123456')
        driver.find_element(By.XPATH, '/html/body/div[2]/div/button[1]').click()
        allure.attach(f"保存用户成功: {username}", name="操作状态", attachment_type=allure.attachment_type.TEXT)

    @allure.step("编辑用户: {username}")
    def edit_user(self, driver, wait, username):
        driver.switch_to.default_content()
        wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
        wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']")))

        driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
        driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(username)
        driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
        time.sleep(1)

        wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
        checkbox = driver.find_element(By.XPATH, "//input[@name='btSelectItem']")
        if not checkbox.is_selected():
            checkbox.click()
        allure.attach("勾选用户", name="操作状态", attachment_type=allure.attachment_type.TEXT)

        wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"edit")]'))).click()
        driver.switch_to.default_content()

        wait.until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, '//*[@id="content-main"]/iframe[3]')))

        nickname_input = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='userName']")))
        nickname_input.clear()
        nickname_input.send_keys(f'{username}_修改')

        wait.until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/div/button[1]'))).click()
        allure.attach("修改用户成功", name="操作状态", attachment_type=allure.attachment_type.TEXT)

    @allure.step("删除用户: {username}")
    def delete_user(self, driver, wait, username):
        driver.switch_to.default_content()
        wait.until(EC.frame_to_be_available_and_switch_to_it("iframe2"))
        wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='loginName']")))

        driver.find_element(By.XPATH, "//input[@name='loginName']").clear()
        driver.find_element(By.XPATH, "//input[@name='loginName']").send_keys(username)
        driver.find_element(By.XPATH, '//*[@id="user-form"]/div/ul/li[5]/a[1]').click()
        time.sleep(1)

        wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@name='btSelectItem']")))
        checkbox2 = driver.find_element(By.XPATH, "//input[@name='btSelectItem']")
        if not checkbox2.is_selected():
            checkbox2.click()
        allure.attach("勾选用户准备删除", name="操作状态", attachment_type=allure.attachment_type.TEXT)

        wait.until(EC.element_to_be_clickable((By.XPATH, '//a[contains(@onclick,"remove")]'))).click()
        driver.switch_to.default_content()

        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.layui-layer-btn0'))).click()
        allure.attach("删除用户成功", name="操作状态", attachment_type=allure.attachment_type.TEXT)

    @allure.severity(allure.severity_level.CRITICAL)
    @allure.title("测试登录及用户增删改操作")
    def test_login_and_user_operations(self, driver, wait):
        unique_username = self.generate_unique_username()
        allure.attach(f"生成的用户名: {unique_username}", name="测试数据", attachment_type=allure.attachment_type.TEXT)

        with allure.step("步骤1: 登录系统"):
            self.login(driver, wait)

        with allure.step("步骤2: 进入用户管理页面"):
            self.enter_user_management(driver, wait)

        with allure.step("步骤3: 新增用户"):
            self.add_user(driver, wait, unique_username)
            time.sleep(2)

        with allure.step("步骤4: 编辑用户"):
            self.edit_user(driver, wait, unique_username)
            time.sleep(2)

        with allure.step("步骤5: 删除用户"):
            self.delete_user(driver, wait, unique_username)
