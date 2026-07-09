import logging
import os
from pageO.login_page import LoginPage

# 配置日志
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, 'test.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class LoginService:
    """
    登录操作层
    封装登录业务操作，调用 LoginPage 完成具体动作
    """

    def __init__(self, driver):
        self.login_page = LoginPage(driver)
        logger.info("LoginService 初始化完成")

    def login(self, username: str, password: str):
        """
        执行登录操作
        :param username: 用户名
        :param password: 密码
        """
        logger.info(f"开始登录操作 - 用户名: {username}")
        try:
            self.login_page.input_username(username)
            logger.info(f"输入用户名: {username}")

            self.login_page.input_password(password)
            logger.info("输入密码: ********")

            self.login_page.click_login_button()
            logger.info("点击登录按钮")

            logger.info(f"登录操作完成 - 用户名: {username}")
        except Exception as e:
            logger.error(f"登录操作失败 - 用户名: {username}, 错误: {str(e)}")
            raise
