import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器"""
    options = Options()
    options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"

    # 无头模式 - Jenkins无显示器环境必须
    options.add_argument("--headless=new")

    # 基础参数
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")

    # 窗口大小
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--start-maximized")

    # 禁用沙箱和安全策略（Jenkins环境必需）
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-setuid-sandbox")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")

    # User-Agent（防止被检测为自动化）
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(30)
    driver.implicitly_wait(10)

    yield driver
    driver.quit()
