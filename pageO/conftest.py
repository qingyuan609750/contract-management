import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器"""
    options = webdriver.ChromeOptions()
    options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--window-size=1920,1080")

    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    yield driver
    driver.quit()
