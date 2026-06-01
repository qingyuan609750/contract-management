from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class UserPage:
    """
    若依用户管理页面对象库类
    """

    # 用户管理菜单
    SYSTEM_MENU = (By.XPATH, "//span[text()='系统管理']")
    USER_MENU = (By.XPATH, "//span[text()='用户管理']")

    # 新增用户按钮
    ADD_BUTTON = (By.XPATH, "//span[text()='新增']")

    # 新增用户表单
    LOGIN_NAME_INPUT = (By.ID, "loginName")
    USER_NAME_INPUT = (By.ID, "userName")
    EMAIL_INPUT = (By.ID, "email")
    PHONE_INPUT = (By.ID, "phonenumber")
    PASSWORD_INPUT = (By.ID, "password")
    SUBMIT_BUTTON = (By.XPATH, "//span[text()='确定']")

    # 修改用户相关元素
    EDIT_BUTTON = (By.XPATH, "//span[text()='修改']")
    EDIT_USER_NAME_INPUT = (By.ID, "userName")
    EDIT_EMAIL_INPUT = (By.ID, "email")
    EDIT_PHONE_INPUT = (By.ID, "phonenumber")
    EDIT_SUBMIT_BUTTON = (By.XPATH, "//div[@class='el-dialog__footer']//span[text()='确定']")

    # 删除用户相关元素
    DELETE_BUTTON = (By.XPATH, "//span[text()='删除']")
    CONFIRM_DELETE_BUTTON = (By.XPATH, "//div[@class='el-message-box__btns']//span[contains(text(),'确定')]")
    CANCEL_DELETE_BUTTON = (By.XPATH, "//div[@class='el-message-box__btns']//span[contains(text(),'取消')]")

    # 搜索相关
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='请输入用户名称']")
    SEARCH_BUTTON = (By.XPATH, "//span[text()='搜索']")

    # 成功提示
    SUCCESS_MSG = (By.CLASS_NAME, "el-message__content")

    # 表格数据
    TABLE_ROWS = (By.XPATH, "//table[@class='el-table__body']//tr")
    FIRST_ROW_USER_NAME = (By.XPATH, "//table[@class='el-table__body']//tr[1]//td[3]//div")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def navigate_to_user_page(self):
        """导航到用户管理页面"""
        self.driver.find_element(*self.SYSTEM_MENU).click()
        self.wait.until(EC.element_to_be_clickable(self.USER_MENU)).click()

    def click_add_user(self):
        """点击新增用户按钮"""
        self.wait.until(EC.element_to_be_clickable(self.ADD_BUTTON)).click()

    def fill_user_form(self, login_name: str, user_name: str, email: str, phone: str, password: str = "123456"):
        """填写用户表单"""
        self.wait.until(EC.visibility_of_element_located(self.LOGIN_NAME_INPUT)).send_keys(login_name)
        self.driver.find_element(*self.USER_NAME_INPUT).send_keys(user_name)
        self.driver.find_element(*self.EMAIL_INPUT).send_keys(email)
        self.driver.find_element(*self.PHONE_INPUT).send_keys(phone)
        self.driver.find_element(*self.PASSWORD_INPUT).send_keys(password)

    def submit_form(self):
        """提交表单"""
        self.driver.find_element(*self.SUBMIT_BUTTON).click()

    def get_success_message(self) -> str:
        """获取成功提示文字"""
        return self.wait.until(EC.visibility_of_element_located(self.SUCCESS_MSG)).text

    def search_user(self, keyword: str):
        """搜索用户"""
        search_input = self.wait.until(EC.visibility_of_element_located(self.SEARCH_INPUT))
        search_input.clear()
        search_input.send_keys(keyword)
        self.driver.find_element(*self.SEARCH_BUTTON).click()

    def click_edit_first_user(self):
        """点击第一个用户的修改按钮"""
        self.wait.until(EC.element_to_be_clickable(self.EDIT_BUTTON)).click()

    def fill_edit_form(self, user_name: str, email: str, phone: str):
        """填写修改用户表单"""
        user_name_input = self.wait.until(EC.visibility_of_element_located(self.EDIT_USER_NAME_INPUT))
        user_name_input.clear()
        user_name_input.send_keys(user_name)

        email_input = self.driver.find_element(*self.EDIT_EMAIL_INPUT)
        email_input.clear()
        email_input.send_keys(email)

        phone_input = self.driver.find_element(*self.EDIT_PHONE_INPUT)
        phone_input.clear()
        phone_input.send_keys(phone)

    def submit_edit_form(self):
        """提交修改表单"""
        self.driver.find_element(*self.EDIT_SUBMIT_BUTTON).click()

    def click_delete_first_user(self):
        """点击第一个用户的删除按钮"""
        self.wait.until(EC.element_to_be_clickable(self.DELETE_BUTTON)).click()

    def confirm_delete(self):
        """确认删除"""
        self.wait.until(EC.element_to_be_clickable(self.CONFIRM_DELETE_BUTTON)).click()

    def cancel_delete(self):
        """取消删除"""
        self.wait.until(EC.element_to_be_clickable(self.CANCEL_DELETE_BUTTON)).click()

    def get_first_user_name(self) -> str:
        """获取表格第一行的用户名"""
        return self.wait.until(EC.visibility_of_element_located(self.FIRST_ROW_USER_NAME)).text

    def get_table_rows_count(self) -> int:
        """获取表格行数"""
        rows = self.driver.find_elements(*self.TABLE_ROWS)
        return len(rows)