import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait


@pytest.fixture(scope="module")
def driver():
    options = Options()
    options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--window-size=1920,1080")

    service = Service(executable_path=r"D:\Git\RuoYi\ruoyi-test\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)
    driver.maximize_window()
    yield driver
    driver.quit()


@pytest.fixture(scope="module")
def wait(driver):
    return WebDriverWait(driver, 10)
