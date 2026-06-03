import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器 - Jenkins无桌面环境配置"""
    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")

    chrome_options = Options()
    # 关键：Jenkins 必须用无头模式
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")

    # 指定浏览器路径
    chrome_options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"

    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.maximize_window()
    driver.implicitly_wait(10)
    yield driver
    driver.quit()
